/***************** Range Widget ************************/

var RangeWidget = function (comm, msg) {
    this.comm = comm;
    comm.on_msg($.proxy(this.handle_msg, this));
    // get the cell that was probably executed
    // msg_id:cell mapping will make this possible without guessing
    this.cell = IPython.notebook.get_cell(IPython.notebook.get_selected_index()-1);
    this.callbacks = {
        iopub : {
            output : $.proxy(this.cell.output_area.handle_output, this.cell.output_area)
        }
    };

    this.keys = ['min', 'max', 'step'];
    this.data = msg.content.data;
    this.id = this.data.id;
    this.get_div();
};

RangeWidget.prototype.get_div = function () {
    var div = $("div." + this.id);
    if (div.length === 0) {
        return null;
    }
    if (div.find("input").length === 0) {
        this.create_range(div);
    }
    return div;
};

RangeWidget.prototype.create_range = function (thediv) {
    var range = $('<input></input>').attr('type', 'range');
    var data = this.data;
    
    for (var i=0; i < this.keys.length; i++) {
        var key = this.keys[i];
        range.attr(key, data[key]);
    }
    range.val(data.value);
    
    thediv.append(
        $("<span/>").addClass("min").text(data.min)
    ).append(
        range
    ).append(
        $("<span/>").addClass("max").text(data.max)
    ).append(
        $("<br/>")
    ).append(
        $("<span/>").addClass("value").text(data.value)
    );
    range.on("change", $.proxy(this.value_changed, this));
}

RangeWidget.prototype.value_changed = function (evt) {
    var now = new Date();
    if (now - this.last_changed < 100) {
        // only update every 0.1s, max
//         return;
    }
    var div = this.get_div();
    var range = div.find("input");
    var data = {};
    for (var i=0; i < this.keys.length; i++) {
        var key = this.keys[i];
        data[key] = parseFloat(range.attr(key));
    }
    data.value = parseFloat(range.val());
    div.find("span.min").text(data.min);
    div.find("span.max").text(data.max);
    div.find("span.value").text(data.value);
    this.comm.send(data, this.callbacks);
    this.last_changed = now;
};

RangeWidget.prototype.handle_msg = function (msg) {
    var data = msg.content.data;
    this.data = data;
    var div = this.get_div();
    if (!div) {
        return;
    }
    var range = div.find("input");

    for (var i=0; i < this.keys.length; i++) {
        var key = this.keys[i];
        range.attr(key, data[key]);
    }
    div.find("span.min").text(data.min);
    div.find("span.max").text(data.max);
    div.find("span.value").text(data.value);
    range.val(data.value);
};

IPython.comm_manager.register_target('range', IPython.utils.always_new(RangeWidget));

/***************** Flot Widget ************************/

$.getScript('//cdnjs.cloudflare.com/ajax/libs/flot/0.8.1/jquery.flot.min.js');
$("<style type='text/css'> .flotwidget{ width: 100%; height: 300px;}</style>").appendTo("head");

var FlotWidget = function (comm, msg) {
    this.comm = comm;
    this.id = msg.content.data.id;
    comm.on_msg($.proxy(this.handle_msg, this));
};

FlotWidget.prototype.handle_msg = function (msg) {
    console.log(msg)
    $.plot($('#' + this.id), msg.content.data.lines);
}

IPython.comm_manager.register_target('flotplot', IPython.utils.always_new(FlotWidget));