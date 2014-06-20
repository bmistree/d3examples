CHECKBOX_ID_PREFIX = 'check_box_id_prefix_';


/**
 @param {list} obj_list --- Each element is an object with numerical
 fields.
 
 @param {list} obj_fields_list --- Each element is a string of a field
 that we can display on the object
 
 @param {string} drawing_div_id

 @param {string} checkbox_div_id
 */
function draw_data_list (
    obj_list, obj_fields_list,drawing_div_id,checkbox_div_id)
{
    $('#'+checkbox_div_id).html(
        generate_checkbox_list_html(obj_fields_list));
    add_checkbox_listeners(obj_fields_list,obj_list);
}

function add_checkbox_listeners(obj_fields_list,obj_list)
{
    for (var i=0; i < obj_fields_list.length; ++i)
    {
        var obj_field = obj_fields_list[i];
        var checkbox_id = CHECKBOX_ID_PREFIX + i;
        $('#' + checkbox_id).click(
            checkbox_listener_factory(obj_field,obj_list));
    }
}

/**
 @returns function
 */
function checkbox_listener_factory(obj_field,obj_list)
{
    return function()
    {
        console.log('Clicked');
        console.log(this);
    };
}

function generate_checkbox_list_html(obj_fields_list)
{
    var to_return = '';

    for (var i = 0; i < obj_fields_list.length; ++i)
    {
        var obj_field = obj_fields_list[i];
        to_return += (
            '<input type="checkbox" id="' + CHECKBOX_ID_PREFIX + i +
                '">' + obj_field + '<br/>');
    }
    return to_return;
}