
/**
 @param {list} params_to_sort_by_list --- Each element is a string.
 It's a field in an object that we should sort the object by.
 */
function AlternateSortParams(
    div_id_to_draw_on,selector_id,div_height,indices_to_sort_by)
{
    this.div_id_to_draw_on = div_id_to_draw_on;
    this.selector_id = selector_id;
    this.div_height = div_height;
    this.indices_to_sort_by = indices_to_sort_by;
    this.width = 500;
    this.normal_circle_height = 50;
    this.lower_circle_height = 80;
    this.higher_circle_height = 20;
}

function AlternateSorter()
{
}

/**
 @param{list} all_data --- Each element is an object
 @param{AlternateSortParams} params
 */
AlternateSorter.prototype.draw_alternate_sort = function (all_data,params)
{
    this.all_data = all_data;
    this.sorted_by_field = params.indices_to_sort_by[0];
    this.params = params;
    
    var selector_html = '<select id="' + params.selector_id + '">';
    for (var i =0; i < params.indices_to_sort_by.length; ++i)
    {
        var opt_value = params.indices_to_sort_by[i];
        selector_html += '<option value="' + opt_value + '">';
        selector_html += opt_value + '</option>';
    }
    
    $('#' + params.div_id_to_draw_on).html(selector_html);
    $('#' + params.selector_id).change(this.selector_listener.bind(this));
    this.original_draw();
};

AlternateSorter.prototype.original_draw = function()
{
    var min_value = min_field_value(this.all_data,this.sorted_by_field);
    var max_value = max_field_value(this.all_data,this.sorted_by_field);
    
    var x_pos_scale = d3.scale.linear().domain([min_value,max_value]).
        rangeRound([0,this.params.width]);

    
    var drawing_area = d3.select('#' + this.params.div_id_to_draw_on).
        append('svg:svg').
        attr('width', this.params.width).
        attr('height', this.params.div_height);

    var this_param = this;
    
    this.all_circles = drawing_area.selectAll('circle').
        data(this.all_data).
        enter().
        append('circle').
        attr('cx',
             function(datum)
             {
                 var x_pos = x_pos_scale(datum[this_param.sorted_by_field]);
                 return x_pos;
             }).
        attr('cy',this_param.params.normal_circle_height).
        attr('r',10).
        style('fill','steelblue');
};

/**
 Gets called when selector updated
 */

AlternateSorter.prototype.selector_listener = function()
{
    var prev_sorted_field = this.sorted_by_field;
    this.sorted_by_field =
        $('#' + this.params.selector_id).find(':selected').text();

    var prev_min_value = min_field_value(this.all_data,prev_sorted_field);
    var prev_max_value = max_field_value(this.all_data,prev_sorted_field);
    
    var min_value = min_field_value(this.all_data,this.sorted_by_field);
    var max_value = max_field_value(this.all_data,this.sorted_by_field);

    var prev_x_pos_scale = d3.scale.linear().domain([prev_min_value,prev_max_value]).
        rangeRound([0,this.params.width]);
    var new_x_pos_scale = d3.scale.linear().domain([min_value,max_value]).
        rangeRound([0,this.params.width]);

    var this_param = this;
    this.all_circles.transition().
        attr('cy',
             // First move circles up or down
             function (datum)
             {
                 var prev_x_pos = prev_x_pos_scale(datum[prev_sorted_field]);
                 var new_x_pos = new_x_pos_scale(datum[this_param.sorted_by_field]);
                 // if translating from left-to-right, then decrease
                 // height
                 if (( prev_x_pos < this_param.params.width/2) &&
                     (new_x_pos > this_param.params.width/2))
                 {
                     return this_param.params.lower_circle_height;
                 }

                 // if translating from right-to-left, then increase
                 // height
                 if (( prev_x_pos > this_param.params.width/2) &&
                     (new_x_pos < this_param.params.width/2))
                 {
                     return this_param.params.higher_circle_height;
                 }

                 return this_param.params.normal_circle_height;

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
                              return new_x_pos_scale(datum[this_param.sorted_by_field]);
                          }).duration(1000).
                     each('end',
                         function()
                         {
                             // now undo vertical movements of data
                             d3.select(this).
                                 transition().
                                 attr('cy',this_param.params.normal_circle_height).duration(1000);
                         });
             });
};




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
