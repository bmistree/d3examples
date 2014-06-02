
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
    var selector_html = '<select id="' + params.selector_id + '">';
    for (var i =0; i < params.indices_to_sort_by.length; ++i)
    {
        var opt_value = params.indices_to_sort_by[i];
        selector_html += '<option value="' + opt_value + '">';
        selector_html += opt_value + '</option>';
    }
    
    $('#' + params.div_id_to_draw_on).html(selector_html);
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
