GRAPH_DIV_ID = 'graph_id';

WIDTH = 500;
HEIGHT = 100;

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
    
    drawing_area.selectAll('circle').
        data(SORT_DATA).
        enter().
        append('circle').
        attr('cx',
             function(datum)
             {
                 var x_pos = x_pos_scale(datum['i1']);
                 return x_pos;
             }).
        attr('cy',50).
        style('fill','steelblue');
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
