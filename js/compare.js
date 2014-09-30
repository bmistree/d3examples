
function CompareParams(div_id_to_draw_on)
{
    this.div_id_to_draw_on = div_id_to_draw_on;
    this.div_width = 800;
    this.div_height = 300;

    this.header_x_offset = 20;
    this.header_spacing = 80;

    this.header_y_offset = 20;
    
    this.object_a_y_offset = 20;
    this.object_b_y_offset = 40;
    this.object_delta_y_offset = 60;

    this.body_rect_a_y_offset = 5;
    this.body_rect_b_y_offset = 25;
    this.body_rect_delta_y_offset = 45;
    this.cell_height = 20;
    this.cell_width = 80;
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

function PairedObject(
    value,background_color,belongs_to_a,col_index,is_delta)
{
    this.value = value;
    this.background_color = background_color;
    this.belongs_to_a = belongs_to_a;
    this.col_index = col_index;
    this.is_delta = is_delta;
}

/**
 @param {Compare} compare_object
 @param {string} body_div_id --- The id of the div to draw
 the table body on.
 */
function draw_body(compare_object,body_div_id)
{
    var normalized_min_color_scale = d3.scale.linear()
        .domain([0,1])
        .range(["green", "white"]);

    // put the normalized min value into this to get result
    var normalized_max_color_scale = d3.scale.linear()
        .domain([0,1])
        .range(["red", "white"]);
    var normalized_delta_color_scale = d3.scale.linear()
        .domain([-1,1])
        .range(["green","white","red"]);
    
    // First, convert all object data to PairedObjects,
    // which then feed into d3 selector.
    var fields_to_compare_list = compare_object.fields_to_compare_list;
    var paired_object_list = [];
    for (var i = 0; i < fields_to_compare_list.length; ++i)
    {
        var field = fields_to_compare_list[i];
        var object_a_value = compare_object.obj_a[field];
        var object_b_value = compare_object.obj_b[field];
        var delta_value = object_a_value - object_b_value;
        
        var max_value = Math.max(object_a_value,object_b_value);
        var min_value = Math.min(object_a_value,object_b_value);
        var normalized_min_value = min_value/max_value;
        var normalized_delta_value = (delta_value)/max_value;
        
        // note that we intentionally enter normalized_min_value
        // to get mirrored color intensity, except for max value.
        var max_color =
            normalized_max_color_scale(normalized_min_value);
        var min_color =
            normalized_min_color_scale(normalized_min_value);
        var delta_color =
            normalized_delta_color_scale(normalized_delta_value);

        var a_color = min_color;
        var b_color = max_color;
        if (max_value == object_a_value)
        {
            // a is bigger than b.
            a_color = max_color;
            b_color = min_color;
        }

        var a_obj =
            new PairedObject(object_a_value, a_color,true,i,false);
        var b_obj =
            new PairedObject(object_b_value, b_color,false,i,false);
        var delta_obj =
            new PairedObject(delta_value, delta_color,false,i,true);
        paired_object_list.push(a_obj);
        paired_object_list.push(b_obj);
        paired_object_list.push(delta_obj);
    }

    // draw paired objects
    var body = d3.select('#' + body_div_id).
        append('svg:svg').
        attr('width', compare_object.compare_params.div_width).
        attr('height', 200);


    var body_fill =  body.selectAll('rect').
        data(paired_object_list).
        enter().
        append('svg:rect').
        attr('height', compare_object.compare_params.cell_height).
        attr('width', compare_object.compare_params.cell_width).
        attr('x',
             function (datum,i)
             {
                 var col_index = datum.col_index;
                 var to_return = header_x(col_index,compare_object.compare_params);
                 return to_return;
             }).
        attr('y',
             function (datum, i)
             {
                 var to_return = 
                     compare_object.compare_params.body_rect_a_y_offset;
                 if ((! datum.belongs_to_a) && (! datum.is_delta))
                 {
                     to_return =
                         compare_object.compare_params.body_rect_b_y_offset;
                 }
                 else if (datum.is_delta)
                 {
                     to_return =
                         compare_object.compare_params.body_rect_delta_y_offset;
                 }
                 return to_return;
             }).
        attr('fill',
            function(datum)
            {
                return datum.background_color;
            }).
        style('opacity',1.0);

    var body_texts = body.selectAll('text').
        data(paired_object_list).
        enter().
        append('svg:text').
            attr('x',
                 function (datum,i)
                 {
                     var col_index = datum.col_index;
                     return header_x(col_index,compare_object.compare_params);
                 }).
            attr('y',
                 function(datum)
                 {
                     if (datum.belongs_to_a)
                         return compare_object.compare_params.object_a_y_offset;
                     else if (datum.is_delta)
                         return compare_object.compare_params.object_delta_y_offset;
                     return compare_object.compare_params.object_b_y_offset;
                 }).
            text(
                function(datum)
                {
                    return datum.value;
                });
    
}

/**
 @param {Compare} compare_object
 @param {string} column_header_div_id --- The id of the div
 to draw column headers on.
 */
function draw_headers(compare_object,column_header_div_id)
{
    var headers = d3.select('#' + column_header_div_id).
        append('svg:svg').
        attr('width', compare_object.compare_params.div_width).
        attr('height', 30);
    
    var headers_texts = headers.selectAll('text').
        data(compare_object.fields_to_compare_list).
        enter().
        append('svg:text').
            attr('x',
                 function (datum,i)
                 {
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