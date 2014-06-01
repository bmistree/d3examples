GRAPH_DIV_ID = 'graph_id';
CHANGE_SORT_INDEX_BUTTON_DIV_ID = 'change_sort_index_button_id';

WIDTH = 500;
HEIGHT = 100;

NORMAL_CIRCLE_HEIGHT = 50;
LOWER_CIRCLE_HEIGHT = 20;
HIGHER_CIRCLE_HEIGHT = 80;

var last_sort_by_index = 'i1';
var all_circles = null;


function on_ready()
{
    var min_value = min_field_value(SORT_DATA,'i1');
    var max_value = max_field_value(SORT_DATA,'i1');
    
    var x_pos_scale = d3.scale.linear().domain([min_value,max_value]).
        rangeRound([0,WIDTH]);

    
    var drawing_area = d3.select('#' + GRAPH_DIV_ID).
        append('svg:svg').
        attr('width', WIDTH).
        attr('height', HEIGHT);
    
    all_circles = drawing_area.selectAll('circle').
        data(SORT_DATA).
        enter().
        append('circle').
        attr('cx',
             function(datum)
             {
                 var x_pos = x_pos_scale(datum['i1']);
                 return x_pos;
             }).
        attr('cy',NORMAL_CIRCLE_HEIGHT).
        attr('r',10).
        style('fill','steelblue');

    $('#' + CHANGE_SORT_INDEX_BUTTON_DIV_ID).click(
        change_sort_index_handler);
}

function change_sort_index_handler()
{
    var prev_sorted_field = last_sort_by_index;
    var field_to_sort_by = 'i2';
    if (last_sort_by_index == 'i2')
    {
        field_to_sort_by = 'i1';
        last_sort_by_index = 'i1';
    }
    else
        last_sort_by_index = 'i2';

    var prev_min_value = min_field_value(SORT_DATA,prev_sorted_field);
    var prev_max_value = max_field_value(SORT_DATA,prev_sorted_field);
    
    var min_value = min_field_value(SORT_DATA,field_to_sort_by);
    var max_value = max_field_value(SORT_DATA,field_to_sort_by);


    var prev_x_pos_scale = d3.scale.linear().domain([prev_min_value,prev_max_value]).
        rangeRound([0,WIDTH]);
    var new_x_pos_scale = d3.scale.linear().domain([min_value,max_value]).
        rangeRound([0,WIDTH]);

    all_circles.transition().
        attr('cy',
             // First move circles up or down
             function (datum)
             {
                 var prev_x_pos = prev_x_pos_scale(datum[prev_sorted_field]);
                 var new_x_pos = new_x_pos_scale(datum[field_to_sort_by]);
                 // if translating from left-to-right, then decrease
                 // height
                 if (( prev_x_pos < WIDTH/2) && (new_x_pos > WIDTH/2))
                     return LOWER_CIRCLE_HEIGHT;

                 // if translating from right-to-left, then increase
                 // height
                 if (( prev_x_pos > WIDTH/2) && (new_x_pos < WIDTH/2))
                     return HIGHER_CIRCLE_HEIGHT;

                 return NORMAL_CIRCLE_HEIGHT;

             }).
        duration(1000).
        each('end',
             // now move circles to their final horizontal position
             function()
             {
                 d3.select(this).
                     transition().
                     attr('cx',
                          function (datum)
                          {
                              return new_x_pos_scale(datum[field_to_sort_by]);
                          }).duration(1000).
                     each('end',
                         function()
                         {
                             // now undo vertical movements of data
                             d3.select(this).
                                 transition().
                                 attr('cy',NORMAL_CIRCLE_HEIGHT).duration(1000);
                         });
             });
}

function min_field_value(data_list,obj_index)
{
    var min = null;
    for (var i=0; i < data_list.length; ++i)
    {
        var data_item = data_list[i];

        if (min == null)
            min = data_item[obj_index];

        if (min > data_item[obj_index])
            min = data_item[obj_index];
    }
    return min;
}

function max_field_value(data_list,obj_index)
{
    var max = null;
    for (var i=0; i < data_list.length; ++i)
    {
        var data_item = data_list[i];

        if (max == null)
            max = data_item[obj_index];

        if (max < data_item[obj_index])
            max = data_item[obj_index];
    }
    return max;
}
