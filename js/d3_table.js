CHECKBOX_ID_PREFIX = 'd3_table_checkbox_prefix_id_';

(function()
 {
     function TableParams(div_id_to_draw_on,div_height,url_to_remove_icon)
     {
         this.url_to_remove_icon = url_to_remove_icon;
         this.div_id_to_draw_on = div_id_to_draw_on;
         this.div_height = div_height;
         this.div_width = 800;
         this.cell_width = 100;
         this.cell_width_padding = 10;
         this.cell_height = 30;
         this.cell_height_padding = 5;
         this.animation_duration_ms = 500;
         this.text_color = 'black';
         this.color_scale = d3.scale.linear()
             .domain([0,10])
             .range(["white", "red"]);
     }

     function datum_x(datum,table_params)
     {
         var h_spacing =
             table_params.cell_width +
             table_params.cell_height_padding;
         var adjust = 0;
         if (datum.h_index === 0)
             adjust += 30;
         return h_spacing * datum.h_index + adjust;
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

      @param {function} color_scale --- A function that returns an
      html color code.
      
      @return {list} --- Each element is an object of the form:
      {
      h_index: <int>, // index of all_data
      v_index: <int>, // index of fields_to_draw
      datum: value
      }
      */
     function convert_all_data_to_data_list(
         all_data,fields_to_draw,table_params)
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
                         // starting horizontal index at 2 instead of 0
                         // to accomodate row labels and kill rows.
                         h_index: data_index + 2,
                         v_index: fields_to_draw_index,
                         datum: datum[field],
                         bg_color: table_params.color_scale(datum[field]),
                         text_color: table_params.text_color
                     });
             }
         }
         return to_return;
     }

     TableFactory = new Tabler();
     function Tabler()
     { }

     Tabler.prototype.table_params = function(
         div_id_to_draw_on,div_height,url_to_remove_icon)
     {
         return new TableParams(
             div_id_to_draw_on,div_height,url_to_remove_icon);
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
         // when have no data, do not sort initial input data objects.
         // when presenting data, should be a string containing the
         // field to draw
         this.sorted_by_field = null;
         
         this.table_params = table_params;
         // maps from ints to booleans.  true if field at v index that
         // is key map is visible.  false if not.
         this.visible_v_indices = {};
         this.fields_to_draw = fields_to_draw;
         this.table = d3.select('#' + table_params.div_id_to_draw_on).
             append('svg:svg').
             attr('width', table_params.div_width).
             attr('height', table_params.div_height);

         // preserved so that can re-sort based on different fields
         this.all_data = all_data;
         this.data_list =
             convert_all_data_to_data_list(
                 all_data,fields_to_draw,table_params);
         
         // add row labels
         for (var i = 0; i < this.fields_to_draw.length; ++i)
         {
             var field_name = this.fields_to_draw[i];
             var label_data_item = {
                 h_index: 1,
                 v_index: i,
                 datum: field_name,
                 bg_color: '#a0a0a0',
                 text_color: 'white'
             };
             this.data_list.push(label_data_item);
         }

         // add category remove buttons
         for (i = 0; i < this.fields_to_draw.length; ++i)
         {
             var field_name = this.fields_to_draw[i];
             var label_data_item = {
                 h_index: 0,
                 v_index: i,
                 datum: '',
                 bg_color: '#a0a0a0',
                 text_color: 'white'
             };
             this.data_list.push(label_data_item);
         }         
         
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
                      return datum.bg_color;
                  }).
             style('opacity',
                   function (datum)
                   {
                       if (datum.h_index === 0)
                           return 0;
                       
                       if (this_ptr.visible_v_indices[datum.v_index])
                           return 1.0;
                       return 0;
                   });

         // draw text on background rectangles
         this.texts = this.table.selectAll('text').
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
             attr('fill',
                  function(datum)
                  {
                      return datum.text_color;
                  });

         
         this.kill_imgs = this.table.selectAll('image').
             data(this.data_list).
             enter().
             append('svg:image').
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
             attr('xlink:href',table_params.url_to_remove_icon).
             style('opacity',
                   function (datum)
                   {
                       if ((datum.h_index === 0) &&
                           (this_ptr.visible_v_indices[datum.v_index]))
                           return 1.0;
                       return 0;
                   });
         
     };

     /**
      @returns {int or null} --- int is vindex.  null means field_name
      not in fields_to_draw.
      */
     Table.prototype._find_v_index = function(finding_field_name)
     {
         var v_index = null;
         for (var i = 0; i < this.fields_to_draw.length; ++i)
         {
             var field_name = this.fields_to_draw[i];
             if (field_name === finding_field_name)
             {
                 v_index = i;
                 break;
             }
         }
         return v_index;
     };

     /**
      @param {string} field_to_remove --- Name of object field to
      remove.
      */
     Table.prototype.remove_field = function (field_to_remove)
     {
         var v_index = this._find_v_index(field_to_remove);
         var this_ptr = this;
         
         // field doesn't exist.
         if (v_index === null)
             return;
         // index is already invisible
         if (! this.visible_v_indices[v_index])
             return;

         this.visible_v_indices[v_index] = false;
         this._animate_transition(v_index,true);
     };

     /**
      @param {string} field_to_insert --- Name of object field to
      draw.
      */
     Table.prototype.insert_field = function (field_to_insert)
     {
         var v_index = this._find_v_index(field_to_insert);
         var this_ptr = this;
         // field doesn't exist.
         if (v_index === null)
             return;
         // index is already being displayed
         if (this.visible_v_indices[v_index])
             return;

         this.visible_v_indices[v_index] = true;
         this._animate_transition(v_index,true);
     };

     /**
      @param {int} v_index --- Vertical index of new row to add.
      
      @param (optional) {bool} check_sort --- true if should run
      check sort afterwards.
      */
     Table.prototype._animate_transition = function(v_index,check_sort)
     {
         var this_ptr = this;
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
                      return datum.bg_color;
                  }).
             style('opacity',
                   function (datum)
                   {
                       if (datum.h_index === 0)
                           return 0;
                       
                       if (this_ptr.visible_v_indices[datum.v_index])
                           return 1.0;
                      
                       return 0;
                   }).
             duration(table_params.animation_duration_ms);

         // draw text
         this.texts.transition().
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

                      var new_entry = v_index == datum.v_index;
                      return datum_y(datum,table_params,
                                    this_ptr.visible_v_indices,new_entry) +
                          v_spacing/2;
                  }).
             text(function(datum)
                  {
                      if (this_ptr.visible_v_indices[datum.v_index])
                          return datum.datum;
                      return '';
                  }).
             attr('fill',
                  function(datum)
                  {
                      return datum.text_color;
                  }).
             duration(table_params.animation_duration_ms);

         this.kill_imgs.transition().
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

                      var new_entry = v_index == datum.v_index;
                      return datum_y(datum,table_params,
                                    this_ptr.visible_v_indices,new_entry);
                  }).
             attr('height',table_params.cell_height).
             attr('width',table_params.cell_width).
             attr('xlink:href',table_params.url_to_remove_icon).
             style('opacity',
                   function (datum)
                   {
                       if ((datum.h_index === 0) &&
                           (this_ptr.visible_v_indices[datum.v_index]))
                           return 1.0;

                       return 0;
                   }).
             duration(table_params.animation_duration_ms);

         
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
                      return datum.bg_color;
                  }).
             style('opacity',
                   function (datum)
                   {
                       if (datum.h_index === 0)
                           return 0;
                       
                       if (this_ptr.visible_v_indices[datum.v_index])
                           return 1.0;
                       return 0;
                   }).
             duration(table_params.animation_duration_ms);

         this.kill_imgs.transition().
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
                                    this_ptr.visible_v_indices,false);
                  }).
             attr('height',table_params.cell_height).
             attr('width',table_params.cell_width).
             attr('xlink:href',table_params.url_to_remove_icon).
             style('opacity',
                   function (datum)
                   {
                       if ((datum.h_index === 0) &&
                           (this_ptr.visible_v_indices[datum.v_index]))
                           return 1.0;

                       return 0;
                   }).
             duration(table_params.animation_duration_ms);

         
         // draws texts
         this.texts.transition().
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
             attr('fill',
                  function(datum)
                  {
                      return datum.text_color;
                  }).
             duration(table_params.animation_duration_ms)
         .each('end',
               function()
               {
                   if (check_sort)
                       this_ptr.check_sort();
               });
         
     };

     Table.prototype.check_sort = function()
     {
         // update h_index for data items

         // key is old h_index, value is new h_index.
         var h_index_mappings = {0:0};
         var top_row = [];
         for (var i = 0; i < this.data_list.length; ++i)
         {
             var datum = this.data_list[i];

             // ignore data labels
             if (datum.h_index == 0)
                 continue;

             if (datum.v_index == 0)
             {
                 top_row[datum.h_index-1] = {
                     datum: datum.datum,
                     h_index: datum.h_index
                 };
             }
         }

         top_row = top_row.sort(
             function(a,b)
             {
                 return a.datum - b.datum;
             });

         for (i=0; i < top_row.length; ++i)
         {
             var top_row_item = top_row[i];
             h_index_mappings[top_row_item.h_index] = i+1;
         }
         // re-map all data items
         for (i = 0; i < this.data_list.length; ++i)
         {
             var datum = this.data_list[i];
             datum.h_index = h_index_mappings[datum.h_index];
         }
         
         this._animate_transition(-1,false);
     };
     
     /**
      Listen for changes to selector.
      */
     Table.prototype.register_selector_listener = function (selector_id)
     {
         var this_ptr = this;
         $('#' + selector_id).change(
             function()
             {
                 this_ptr.selector_pressed(selector_id);
             });
     };

     /**
      @param {Selector object} selector_element --- 
      */
     Table.prototype.selector_pressed = function(selector_id)
     {
         var prev_sorted_field = this.sorted_by_field;
         this.sorted_by_field = $('#' + selector_id).find(':selected').text();
         console.log('Sorted ' + this.sorted_by_field);
         this.make_top(this.sorted_by_field);
     };

     Table.prototype.make_top = function(field_to_make_top)
     {
         var v_index = this._find_v_index(field_to_make_top);
         if (v_index === null)
             return;

         // run through data list and update all 
         // elements.v_index === v_index to have 0 v_index, all
         // elements.v_index < v_index to have one more v_index, and
         // leave all others unchanged
         for (var i = 0; i < this.data_list.length; ++i)
         {
             var datum = this.data_list[i];
             if (datum.v_index == v_index)
                 datum.v_index = 0;
             else if (datum.v_index < v_index)
                 ++ datum.v_index;
         }

         // update visible_v_indices with new indexes as well.
         var old_visible_v_indices = this.visible_v_indices;
         this.visible_v_indices = {};
         for (var v_ind in old_visible_v_indices)
         {
             v_ind = parseInt(v_ind);
             var old_val = old_visible_v_indices[v_ind];
             if (v_ind === v_index)
                 this.visible_v_indices[0] = old_val;
             else if (v_ind < v_index)
             {
                 this.visible_v_indices[v_ind +1] = old_val;
             }
             else
                 this.visible_v_indices[v_ind] = old_val;
         }

         // re-organizing fields_to_draw so that 0 in
         this.fields_to_draw.splice(v_index,1);
         this.fields_to_draw.unshift(0);
         this.fields_to_draw[0] = field_to_make_top;
         // actually animate transition
         this._animate_transition(-1,true);
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

    setInterval(redraw_func,1000);
}



/**
 @param {string} checkbox_div_id --- Div id for checkbox.
 @param {list} field_list --- Each element is a string
 @param {Table} table
 */
function render_checkboxes(checkbox_div_id,field_list,table)
{
    $('#'+checkbox_div_id).html(
        generate_checkbox_list_html(field_list));
    add_checkbox_listeners(field_list,table);
}

function add_checkbox_listeners(obj_fields_list,table)
{
    for (var i=0; i < obj_fields_list.length; ++i)
    {
        var obj_field = obj_fields_list[i];
        var checkbox_id = CHECKBOX_ID_PREFIX + i;
        $('#'+checkbox_id).click(
            button_clicked_listener_factory(obj_field,table));
    }
}

/**
 @returns function
 */
function button_clicked_listener_factory(obj_field,table)
{
    return function()
    {
        table.insert_field(obj_field);
        $(this).remove();
    };
}


/**
 @returns function
 */
function checkbox_listener_factory(obj_field,table)
{
    return function()
    {
        var is_checked = $(this).prop('checked');
        if (is_checked)
            table.insert_field(obj_field);
        else
            table.remove_field(obj_field);
    };
}


function generate_checkbox_list_html(obj_fields_list)
{
    var to_return = '';
    for (var i = 0; i < obj_fields_list.length; ++i)
    {
        var obj_field = obj_fields_list[i];
        to_return += (
            '<button id="' + CHECKBOX_ID_PREFIX + i +
                '">' + obj_field + '</button>&nbsp&nbsp&nbsp');
    }
    return to_return;
}



SELECTOR_ID = 'selector_id';

/**
 @param {string} div_to_draw_selector_on_id --- Div id to draw
 selector on.
 
 @param {list} obj_fields_list --- Each element is a string choose
 which to sort by.

 @param {Table} table --- table to re-sort when select different value
 to sort by.
 */
function draw_sort_by_selector (
    div_to_draw_selector_on_id,obj_fields_list,table)
{
    var selector_html = '<select id="' + SELECTOR_ID + '">';
    for (var i =0; i < obj_fields_list.length; ++i)
    {
        var opt_value = obj_fields_list[i];
        selector_html += '<option value="' + opt_value + '">';
        selector_html += opt_value + '</option>';
    }
    
    $('#' + div_to_draw_selector_on_id).html(selector_html);
    table.register_selector_listener(SELECTOR_ID);
};
