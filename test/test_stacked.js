
DIV_ID_TO_DRAW_ON = 'graph_id';
NOTES_DIV_ID = 'notes_graph_id';
STACKED_BAR_HEIGHT = 800;

function on_ready()
{
    var params = StackedGraphFactory.params(DIV_ID_TO_DRAW_ON,STACKED_BAR_HEIGHT);
    params.hover_func = function (datum)
    {
       var time_ns =
           datum.end - datum.start;
       var time_us = time_ns / 1000;
       $('#' + NOTES_DIV_ID).html(
           'Event: ' + datum.label + '<br/>' +
               'Time taken: ' + time_us.toFixed(2) + 'us.');
    };
    params.unhover_func = function(datum)
    {
        $('#' + notes_div_id).html('<br/><br/>');
    };
    StackedGraphFactory.draw_stacked(STACKED_DATA,params);
}