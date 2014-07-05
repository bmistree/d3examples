
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

function draw_table(all_data,fields_to_draw,table_params)
{
    var table = d3.select('#' + table_params.div_id_to_draw_on).
        append('svg:svg').
        attr('width', table_params.div_width).
        attr('height', table_params.div_height);

    var data_list = convert_all_data_to_data_list(all_data,fields_to_draw);
    
    // draw background rectangles
    table.selectAll('rect').
        data(data_list).
        enter().
        append('svg:rect').
        attr('x',
             function (datum)
             {
                 var h_spacing =
                     table_params.cell_width +
                     table_params.cell_height_padding;
                 return h_spacing * datum.h_index;
             }).
        attr('y',
             function (datum)
             {
                 var v_spacing =
                     table_params.cell_height +
                     table_params.cell_height_padding;
                 return v_spacing * datum.v_index;
             }).
        attr('height',table_params.cell_height).
        attr('width',table_params.cell_width).
        attr('fill','steelblue');
}