
function CompareParams(div_id_to_draw_on)
{
    this.div_id_to_draw_on = div_id_to_draw_on;
    this.div_width = 800;
    this.div_height = 300;

    this.header_x_offset = 20;
    this.header_spacing = 80;

    this.header_y_offset = 20;
}

CompareParams.prototype.prepend_div_id = function(to_prepend_to)
{
    return this.div_id_to_draw_on + '____' + to_prepend_to;
};


/**
 @param {Any} obj_a
 @param {Any} obj_b
 @param {list} fields_to_compare --- Each element is a string, naming
 the field of the object to compare.  Will compare fields in this
 order.
 @param {CompareParams} compare_params ---
 */
function Compare(
    obj_a, obj_a_name, obj_b, obj_b_name,
    fields_to_compare_list,compare_params)
{
    this.obj_a = obj_a;
    this.obj_a_name = obj_a_name;
    this.obj_b = obj_b;
    this.obj_b_name = obj_b_name;
    this.fields_to_compare_list = fields_to_compare_list;
    this.compare_params = compare_params;


    this.update();
}

/**
 After updating fields, 
 */
Compare.prototype.update = function ()
{
    var column_header_div_id =
        this.compare_params.prepend_div_id('column_header_div_id');
    var table_body_div_id =
        this.compare_params.prepend_div_id('table_body_div_id');

    $('#' + this.compare_params.div_id_to_draw_on).html(
        '<div id="' + column_header_div_id + '"></div>' +
            '<div id="' + table_body_div_id + '"></div>');

    draw_headers(this,column_header_div_id);
    draw_body(this,table_body_div_id);
};

/**
 @param {Compare} compare_object
 */
function draw_headers(compare_object,column_header_div_id)
{
    var headers = d3.select('#' + column_header_div_id).
        append('svg:svg').
        attr('width', this.compare_params.div_width).
        attr('height', 50);
    
    var headers_texts = headers.selectAll('text').
        data(compare_object.fields_to_compare_list).
        enter().
        append('svg:text').
            attr('x',
                 function (datum,i)
                 {
                     console.log("Got in here " + i);
                     return header_x(i,compare_object.compare_params);
                 }).
           attr('y', compare_object.compare_params.header_y_offset).
        text(function(datum) { return datum;});
    return headers_texts;
}

function header_x(data_index, compare_params)
{
    return compare_params.header_x_offset +
        data_index * compare_params.header_spacing;
}