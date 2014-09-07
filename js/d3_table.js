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

     /**
      Get the x position that should draw datum in for the given table
      parameters.
      */
     function datum_x(datum,table_params)
     {
         if (! datum.visible)
             return 0;
         
         var h_spacing =
             table_params.cell_width +
             table_params.cell_height_padding;
         var adjust = 0;
         if (datum.h_index === 0)
             adjust += 30;
         var to_return = h_spacing * datum.h_index + adjust;

         return to_return;
     }
     /**
      @param {bool} new_entry --- If new entry, use one less v_index.
      */
     function datum_y(datum,table_params,new_entry)
     {
         var v_index = datum.v_index;
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
      @param {int} h_index --- index of all_data
      @param {int} v_index --- index of fields_to_draw
      @param {Any} value
      @param {bool} visible --- Whether or not this field is visible
      @param {string} bg_color --- Color to draw for this value.
      @param {string} text_color --- Color for font color
      @param {string} field_name --- Name of field
      */
     function Datum(
         h_index, v_index,value,visible,bg_color,text_color,field_name)
     {
         this.h_index = h_index;
         this.v_index = v_index;
         this.value = value;
         this.visible = visible;
         this.bg_color = bg_color;
         this.text_color = text_color;
         this.field_name = field_name;
     }
     
     /**
      @param {list} all_data --- Each element is an object

      @param {list} fields_to_draw --- Each element is a string

      @param {function} color_scale --- A function that returns an
      html color code.
      
      @return {list} --- Each element is a Datum object.
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
             var row_name_datum =
                 new Datum(
                     1,-1,field,false,'#a0a0a0','white',field);
             var kill_row_datum =
                 new Datum(
                     0,-1,'',false,'#a0a0a0','white',field);

             to_return.push(row_name_datum);
             to_return.push(kill_row_datum);

             // now insert actual data
             for (var data_index = 0; data_index < all_data.length;
                  ++data_index)
             {
                 var datum = all_data[data_index];
                 var new_item =
                     new Datum(
                         data_index + 2, -1, datum[field],
                         false,
                         table_params.color_scale(datum[field]),
                         table_params.text_color,
                         field);
                 
                 to_return.push(new_item);
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
         all_data,fields_to_draw,table_params,column_headers)
     {
         var to_return = new Table(
             all_data,fields_to_draw,table_params,column_headers);
         return to_return;
     };

     /**
      Render all the category headers that can sort by.
      
      @param {string} column_header_div_id --- The div id for the div
      to write the names of the column headers.

      @param {TableParams} table_params --- Keeps track of parameters
      for table parameters.

      @param {list} column_headers --- Each element is a string.  The
      plaintext name of each column field.
      
      */
     function draw_column_headers(
         column_header_div_id,table_params,column_headers)
     {
         var headers = d3.select('#' + column_header_div_id).
             append('svg:svg').
             attr('width', table_params.div_width).
             attr('height', 30);

         var headers_texts = headers.selectAll('text').
             data(column_headers).
             enter().
             append('svg:text').
             attr('x',
                  function (datum,i)
                  {
                      return datum_x(datum,table_params) + 10;
                  }).
             attr('y',
                  function(datum,i)
                  {
                      var v_spacing =
                          table_params.cell_height +
                          table_params.cell_height_padding;
                      
                      return datum_y(datum,table_params,false) +
                          v_spacing/2;
                  }).
             text(function(datum)
                  {
                      return datum.value;
                  });

         return headers_texts;
     }

     /**
      Render the backgrounds for all background rectangles.
      
      @param {Table} table
      @param {D3 node} d3_node --- Selection from d3.
      @param {list} data_list --- Each element is a Datum object.
      @param {TableParams} table_params --- 
     */
     function draw_rectangles(table,d3_node,data_list,table_params)
     {
         // draw background rectangles
         var rectangles = d3_node.selectAll('rect').
             data(data_list).
             enter().
             append('svg:rect');

         return set_rectangles_positions_and_fill(
             rectangles,table_params).
             on('click',
                function(datum)
                {
                    // set click handler to move row up if click on row name.
                    if ((datum.h_index === 1) && datum.visible)
                        table.make_top(datum.field_name);
                });
     }

     function set_rectangles_positions_and_fill(
         rectangles_d3_node,table_params)
     {
         return rectangles_d3_node.
             attr('x',
                  function (datum)
                  {
                      return datum_x(datum,table_params);
                  }).
             attr('y',
                  function(datum)
                  {
                      return datum_y(datum,table_params,false);
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
                       
                       if (datum.visible)
                           return 1.0;
                       return 0;
                   });
     }
     

     /**
      Write text labels on top of each box.
      
      For params, @see draw_rectangles
      */
     function draw_texts(table,d3_node,data_list,table_params)
     {
         // draw text on background rectangles
         var texts = d3_node.selectAll('text').
             data(data_list).
             enter().
             append('svg:text');

         set_text_positions_and_fills(table,texts,table_params)
             .on('click',
                function(datum)
                {
                    // set click handler to move row up if click on row name.
                    if ((datum.h_index === 1) && datum.visible)
                        table.make_top(datum.field_name);
                });
         return texts;
     }

     /**
      Sets attributes for text positions and fills.

      @returns d3 node that setting positions and fills for.
      */
     function set_text_positions_and_fills(table,texts_d3_node,table_params)
     {
         return texts_d3_node.attr('x',
                  function (datum)
                  {
                      return datum_x(datum,table_params) + 10;
                  }).
             attr('y',
                  function(datum)
                  {
                      var v_spacing =
                          table_params.cell_height +
                          table_params.cell_height_padding;
                      
                      return datum_y(datum,table_params,false) +
                          v_spacing/2;
                  }).
             text(function(datum)
                  {
                      if (datum.visible)
                          return datum.value;
                      return '';
                  }).
             attr('fill',
                  function(datum)
                  {
                      return datum.text_color;
                  });
     }

     /**
      Each table row contains an image that a user can click on to
      remove the row (and potentially re-sort the list when the row
      gets removed).

      See parameters for draw_texts.
      */
     function draw_kill_imgs(
         table,d3_node,data_list,table_params)
     {
         var kill_imgs = d3_node.selectAll('image').
             data(data_list).
             enter().
             append('svg:image');
         return set_kill_imgs_positions_and_fill(
             kill_imgs,table_params).
             on('click',
                function(datum)
                {
                    // only want to set click handler for icons we're displaying
                    if ((datum.h_index === 0) && datum.visible)
                        table.remove_field(datum.field_name);
                    // set click handler to move row up if click on row name.
                    if ((datum.h_index === 1) && datum.visible)
                        table.make_top(datum.field_name);
                });
     }

     function set_kill_imgs_positions_and_fill(
         kill_imgs_d3_node,table_params)
     {
         return kill_imgs_d3_node.
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

                      return datum_y(datum,table_params,false);
                  }).
             attr('height',table_params.cell_height).
             attr('width',table_params.cell_width).
             attr('xlink:href',table_params.url_to_remove_icon).
             style('opacity',
                   function (datum)
                   {
                       if ((datum.h_index === 0) && datum.visible)
                           return 1.0;
                       return 0;
                   });
     }
     
     function Table(all_data,fields_to_draw,table_params,column_headers)
     {
         // when have no data, do not sort initial input data objects.
         // when presenting data, should be a string containing the
         // field to draw
         this.sorted_by_field = null;

         this.next_row_index = 0;
         // labels for columns.
         this.column_headers = copy_column_headers(column_headers);

         this.table_params = table_params;
         this.fields_to_draw = fields_to_draw;

         var column_header_div_id = 'column_header_div_id';
         var table_div_id = 'table_div_id';
         $('#' + table_params.div_id_to_draw_on).html(
             '<div id="' + column_header_div_id + '"></div>' +
                 '<div id="' + table_div_id + '"></div>');

         this.headers_texts = draw_column_headers(
             column_header_div_id,table_params,this.column_headers);
         
         
         this.table = d3.select('#' + table_div_id).
             append('svg:svg').
             attr('width', table_params.div_width).
             attr('height', table_params.div_height);

         // preserved so that can re-sort based on different fields
         this.all_data = all_data;
         this.data_list =
             convert_all_data_to_data_list(
                 all_data,fields_to_draw,table_params);
         
         var this_ptr = this;
         this.rectangles = draw_rectangles(
             this,this.table,this.data_list,table_params);

         this.texts = draw_texts(
             this,this.table,this.data_list,table_params);

         this.kill_imgs = draw_kill_imgs(
             this,this.table,this.data_list,table_params);                  
         
     };

     /**
      @returns {int or null} --- int is vindex.  null means field_name
      not in fields_to_draw.
      */
     Table.prototype._find_v_index = function(finding_field_name)
     {
         for (var i = 0; i < this.data_list.length; ++i)
         {
             var datum = this.data_list[i];
             if ((datum.h_index === 1) && (finding_field_name === datum.field_name))
             {
                 if (datum.visible)
                     return datum.v_index;
                 return null;
             }
         }
         return null;
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

         for (var i =0; i < this.data_list.length; ++i)
         {
             var datum = this.data_list[i];
             if (datum.v_index == v_index)
             {
                 datum.v_index = -1;
                 datum.visible = false;
             }

             if (datum.visible)
             {
                 if (datum.v_index > v_index)
                     --datum.v_index;
             }
         }

         --this.next_row_index;
         this._animate_transition(v_index,true);

         // draw the button again.
         for (i = 0; i < this.obj_fields_list.length; ++i)
         {
             var obj_field = this.obj_fields_list[i];
             if (obj_field !== field_to_remove)
                 continue;

             var new_button_html = single_button_element_html(
                 obj_field,i);
             $('#' + this.checkbox_div_id).append(new_button_html);

             var checkbox_id = CHECKBOX_ID_PREFIX + i;
             $('#'+checkbox_id).click(
                 button_clicked_listener_factory(obj_field,this));
         }
     };

     /**
      @param {string} field_to_insert --- Name of object field to
      draw.
      */
     Table.prototype.insert_field = function (field_to_insert)
     {
         var v_index = this.next_row_index++;

         for (var i =0; i < this.data_list.length; ++i)
         {
             var datum = this.data_list[i];

             if (datum.field_name === field_to_insert)
             {                 
                 datum.visible = true;
                 datum.v_index = v_index;
             }
         }
         
         this._animate_transition(v_index,true);
     };

         
     /**
      @param {int} v_index --- Vertical index of new row to add.
      
      @param (optional) {bool} check_sort --- true if should run
      check sort afterwards.
      */
     Table.prototype._animate_transition = function(v_index,check_sort)
     {
         // Insert new element
         var this_ptr = this;
         set_rectangles_positions_and_fill(
             this.rectangles.transition(),this.table_params).
             duration(this_ptr.table_params.animation_duration_ms);
         set_kill_imgs_positions_and_fill(
             this.kill_imgs.transition(),this.table_params).
             duration(this_ptr.table_params.animation_duration_ms);

         // draws new text positions as part of animation
         set_text_positions_and_fills(
             this,this.texts.transition(),this.table_params)
             .duration(this_ptr.table_params.animation_duration_ms)
             .each('end',
               function()
               {
                   if (check_sort)
                       this_ptr.check_sort();
               });             
     };

     Table.prototype.check_sort = function()
     {
         // update h_index for data items... sort by fields that are
         // visible and have v_index = 0;

         // how many columns before data begins.
         var data_col_offset = 2;
         
         // key is old h_index, value is new h_index.
         var h_index_mappings = {0:0};
         var top_row = [];
         for (var i = 0; i < this.data_list.length; ++i)
         {
             var datum = this.data_list[i];

             // ignore data labels
             if (datum.h_index == 0)
                 continue;

             // FIXME: note: shouldn't hard code 2 here.  Using it so
             // that only sort h_indices that don't include kill
             // button or row label.
             if ((datum.v_index == 0) && datum.visible &&
                 (datum.h_index >= data_col_offset))
             {
                 top_row.push(
                     {
                         value: datum.value,
                         h_index: datum.h_index
                     });
             }
         }

         top_row = top_row.sort(
             function(a,b)
             {
                 return a.value - b.value;
             });

         for (i=0; i < top_row.length; ++i)
         {
             var top_row_item = top_row[i];
             h_index_mappings[top_row_item.h_index] = i+data_col_offset;
         }
         // re-map all data items
         for (i = 0; i < this.data_list.length; ++i)
         {
             var datum = this.data_list[i];
             // checking because kill button col and label col are not
             // in h_index_mappings.
             if (datum.h_index in h_index_mappings)
                 datum.h_index = h_index_mappings[datum.h_index];
         }

         for (i = 0; i < this.column_headers.length; ++i)
         {
             var item = this.column_headers[i];
             if (item.h_index in h_index_mappings)
                 item.h_index = h_index_mappings[item.h_index];
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

         // actually animate transition
         this._animate_transition(-1,true);
     };

     /**
      @param {list} column_headers --- Each element is a string.

      @returns{list} --- Each element has an h_index in it.  Initial
      h_index starts at 2 and increments by one each.
      */
     function copy_column_headers(column_headers)
     {
         var to_return = [];
         for (var i =0; i < column_headers.length; ++i)
         {
             var val = column_headers[i];
             to_return.push(
                 {
                     h_index: i + 2,
                     v_index: 0,
                     value: val,
                     visible: true
                 });
         }
         return to_return;
     }
     
     
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
    table.checkbox_div_id = checkbox_div_id;
    table.obj_fields_list = field_list;
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
        to_return += single_button_element_html(obj_field,i);
    }
    return to_return;
}

function single_button_element_html(obj_field,index)
{    
    return '<button id="' + CHECKBOX_ID_PREFIX + index +
        '">' + obj_field + '</button>';
}

