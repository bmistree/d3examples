CHECKBOX_ID_PREFIX = 'check_box_id_prefix_';
TABLE_ID_PREFIX = 'table_id_prefix_';
ROW_ID_PREFIX = 'row_id_prefix_';

WIDTH = 500;
HEIGHT = 500;

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

    add_tables(drawing_div_id,obj_list,obj_fields_list);
    add_checkbox_listeners(obj_fields_list,obj_list);
}

function add_tables(drawing_div_id,obj_list,obj_fields_list)
{
    var table_html = '<table><tr><td style="width:50px;"></td>';
    for (var i = 0; i < obj_list.length; ++i)
    {
        table_html += '<td>Patient ' + i + '</td>';
        table_html += '<td style="width:20px;"></td>';
    }

    table_html += '</tr><tr><td style="width:50px;"></td>';
    for (i = 0; i < obj_list.length; ++i)
    {
        table_html += (
            '<td> ' +
                '<table>' +
                '<tr id="' + TABLE_ID_PREFIX + i +
                '"></tr></table>' +
            '</td>');
        table_html += '<td style="width:20px;"></td>';
    }
    table_html += '</tr></table>';    
    $('#' + drawing_div_id).html(table_html);
}


function add_checkbox_listeners(obj_fields_list,obj_list)
{
    for (var i=0; i < obj_fields_list.length; ++i)
    {
        var obj_field = obj_fields_list[i];
        var checkbox_id = CHECKBOX_ID_PREFIX + i;
        $('#' + checkbox_id).click(
            checkbox_listener_factory(obj_field,i,obj_list));
    }
}

/**
 @returns function
 */
function checkbox_listener_factory(obj_field,obj_field_index,obj_list)
{
    return function()
    {
        var is_checked = $(this).prop('checked');
        for (var i = 0; i < obj_list.length; ++i)
        {
            var obj = obj_list[i];
            var obj_table_id = TABLE_ID_PREFIX + i;
            var row_id = ROW_ID_PREFIX + '_' + i + '_' + obj_field_index;

            if (is_checked)
            {
                var row_html =
                    '<tr id="' + row_id +'">' + 
                    '<td>' + obj_field + ': &nbsp&nbsp' + obj[obj_field] + 
                    '</td></tr>';
                
                $(row_html).
                    hide().
                    insertAfter(
                        $('#' + obj_table_id).
                            parent().
                            parent()).
                    slideDown('slow');
            }
            else
            {
                $('#' + row_id).fadeOut();
            }
        }
        
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