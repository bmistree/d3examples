(function()
 {
     function TableParams(div_id_to_draw_on,div_height)
     {
         this.div_id_to_draw_on = div_id_to_draw_on;
         this.div_height = div_height;
         this.div_width = 800;
         this.cell_width = 100;
         this.cell_width_padding = 10;
         this.cell_height = 30;
         this.cell_height_padding = 5;
     }

     function datum_x(datum,table_params)
     {
         var h_spacing =
             table_params.cell_width +
             table_params.cell_height_padding;
         return h_spacing * datum.h_index;
     }
     /**
      @param {bool} new_entry --- If new entry, use one less v_index.
      */
     function datum_y(datum,table_params,visible_indices,new_entry)
     {
         var v_index = 0;
         for (var visible_index in visible_indices)
         {
             var is_visible = visible_indices[visible_index];
             if ((visible_index < datum.v_index) && (is_visible))
                 ++v_index;
         }
         if (new_entry)
             --v_index;
         if (v_index < 0)
             v_index = 0;
         
         var v_spacing =
             table_params.cell_height +
             table_params.cell_height_padding;
         return v_spacing * v_index;
     }

     /**
      @param {list} all_data --- Each element is an object

      @param {list} fields_to_draw --- Each element is a string

      @return {list} --- Each element is an object of the form:
      {
      h_index: <int>, // index of all_data
      v_index: <int>, // index of fields_to_draw
      datum: value
      }
      */
     function convert_all_data_to_data_list(all_data,fields_to_draw)
     {
         var to_return = [];
         for (var fields_to_draw_index = 0;
              fields_to_draw_index < fields_to_draw.length;
              ++fields_to_draw_index)
         {
             var field = fields_to_draw[fields_to_draw_index];
             for (var data_index = 0; data_index < all_data.length;
                  ++data_index)
             {
                 var datum = all_data[data_index];
                 to_return.push(
                     {
                         h_index: data_index,
                         v_index: fields_to_draw_index,
                         datum: datum[field]
                     });
             }
         }
         return to_return;
     }

     TableFactory = new Tabler();
     function Tabler()
     { }

     Tabler.prototype.table_params = function(
         div_id_to_draw_on,div_height)
     {
         return new TableParams(div_id_to_draw_on,div_height);
     };
     
     Tabler.prototype.draw_table = function(
         all_data,fields_to_draw,table_params)
     {
         var to_return = new Table(
             all_data,fields_to_draw,table_params);
         return to_return;
     };
     
     function Table(all_data,fields_to_draw,table_params)
     {
         this.table_params = table_params;
         // maps from ints to booleans.  true if field at v index that
         // is key map is visible.  false if not.
         this.visible_v_indices = {};
         this.fields_to_draw = fields_to_draw;
         this.table = d3.select('#' + table_params.div_id_to_draw_on).
             append('svg:svg').
             attr('width', table_params.div_width).
             attr('height', table_params.div_height);

         this.data_list = convert_all_data_to_data_list(all_data,fields_to_draw);

         var this_ptr = this;
         
         // draw background rectangles
         this.rectangles = this.table.selectAll('rect').
             data(this.data_list).
             enter().
             append('svg:rect').
             attr('x',
                  function (datum)
                  {
                      return datum_x(datum,table_params);
                  }).
             attr('y',
                  function(datum)
                  {
                      return datum_y(datum,table_params,
                                    this_ptr.visible_v_indices,false);
                  }).
             attr('height',table_params.cell_height).
             attr('width',table_params.cell_width).
             attr('fill',
                  function(datum)
                  {
                      if (this_ptr.visible_v_indices[datum.v_index])
                          return 'steelblue';                      
                      
                      return 'transparent';
                  });


         // draw text on background rectangles
         this.table.selectAll('text').
             data(this.data_list).
             enter().
             append('svg:text').
             attr('x',
                  function (datum)
                  {
                      return datum_x(datum,table_params);
                  }).
             attr('y',
                  function(datum)
                  {
                      var v_spacing =
                          table_params.cell_height +
                          table_params.cell_height_padding;
                      
                      return datum_y(datum,table_params,
                                    this_ptr.visible_v_indices,false) +
                          v_spacing/2;
                  }).
             text(function(datum)
                  {
                      if (this_ptr.visible_v_indices[datum.v_index])
                          return datum.datum;
                      return '';
                  }).
             attr('fill','white');

     };

     Table.prototype.insert_field = function (field_to_insert)
     {
         var v_index = null;
         for (var i = 0; i < this.fields_to_draw.length; ++i)
         {
             var field_name = this.fields_to_draw[i];
             if (field_name === field_to_insert)
             {
                 v_index = i;
                 break;
             }
         }

         var this_ptr = this;
         
         // field doesn't exist.
         if (v_index === null)
             return;
         // index is already being displayed
         if (this.visible_v_indices[v_index])
             return;

         this.visible_v_indices[v_index] = true;
         
         // first part of transition, make room for new row:
         this.rectangles.transition().
             attr('x',
                  function (datum)
                  {
                      return datum_x(datum,table_params);
                  }).
             attr('y',
                  function(datum)
                  {
                      var new_entry = v_index == datum.v_index;
                      return datum_y(datum,table_params,
                                    this_ptr.visible_v_indices,new_entry);
                  }).
             attr('height',table_params.cell_height).
             attr('width',table_params.cell_width).
             attr('fill',
                  function(datum)
                  {
                      return 'steelblue';
                  }).
             style('opacity',
                   function (datum)
                   {
                       if (datum.v_index == v_index)
                           return 0;
                       
                       if (this_ptr.visible_v_indices[datum.v_index])
                           return 1.0;
                      
                       return 0;
                   }).
             duration(1000);
         
         // second part of transition, drop the new element into place
         this.rectangles.transition().
             attr('x',
                  function (datum)
                  {
                      return datum_x(datum,table_params);
                  }).
             attr('y',
                  function(datum)
                  {
                      // not new_entry
                      return datum_y(datum,table_params,
                                    this_ptr.visible_v_indices,false);
                  }).
             attr('height',table_params.cell_height).
             attr('width',table_params.cell_width).
             attr('fill',
                  function(datum)
                  {
                      return 'steelblue';
                  }).
             style('opacity',
                   function (datum)
                   {
                       if (this_ptr.visible_v_indices[datum.v_index])
                           return 1.0;
                      
                       return 0;
                   }).
             duration(1000);
     };
 })();

/**
 @param {Table} table
 @param {list} field_list

 Randomly insert fields every two seconds.
 */
function draw_random_fields(table,field_list)
{
    var index_to_draw_on = 5;
    var redraw_func = function()
    {
        var rand_index = Math.floor(Math.random()*field_list.length);
        console.log('Trying to draw ' + field_list[rand_index]);
        table.insert_field(field_list[rand_index]);
        // table.insert_field(field_list[index_to_draw_on--]);
    };

    setInterval(redraw_func,4000);
}