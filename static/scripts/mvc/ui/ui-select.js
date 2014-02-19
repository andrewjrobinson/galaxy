// dependencies
define(['utils/utils'], function(Utils) {

// plugin
var View = Backbone.View.extend(
{
    // options
    optionsDefault: {
        css         : '',
        placeholder : 'No data available',
        data        : [],
        value       : null
    },
    
    // initialize
    initialize : function(options) {
        // configure options
        this.options = Utils.merge(options, this.optionsDefault);
        
        // create new element
        this.setElement(this._template(this.options));
        
        // add to dom
        this.options.container.append(this.$el);
        
        // link selection dictionary
        this.select_data = this.options.data;
        
        // refresh
        this._refresh();
        
        // initial value
        if (this.options.value) {
            this._setValue(this.options.value);
        }
        
        // add change event
        var self = this;
        if (this.options.onchange) {
            this.$el.on('change', function() {
                self.options.onchange(self.value());
            });
        }
    },
    
    // value
    value : function (new_value) {
        // get current id/value
        var before = this._getValue();
        
        // check if new_value is defined
        if (new_value !== undefined) {
            this._setValue(new_value);
        }
        
        // get current id/value
        var after = this._getValue();
        
        // fire onchange
        if ((after != before && this.options.onchange)) {
            this.options.onchange(after);
        }
            
        // return current value
        return after;
    },
    
    // label
    text : function () {
        return this.$el.select2('data').text;
    },
    
    // disabled
    disabled: function() {
        return !this.$el.select2('enable');
    },

    // enable
    enable: function() {
        this.$el.select2('enable', true);
    },
        
    // disable
    disable: function() {
        this.$el.select2('enable', false);
    },
    
    // add
    add: function(options) {
        // add options
        this.select_data.push({
            id      : options.id,
            text    : options.text
        });
        
        // refresh
        this._refresh();
    },
    
    // remove
    del: function(id) {
        // search option
        var index = this._getIndex(id);
        
        // check if found
        if (index != -1) {
            // remove options
            this.select_data.splice(index, 1);
        
            // refresh
            this._refresh();
        }
    },
    
    // remove
    remove: function() {
        this.$el.select2('destroy');
    },
    
    // update
    update: function(options) {
        // copy options
        this.select_data = [];
        for (var key in options.data) {
            this.select_data.push(options.data[key]);
        }
        
        // refresh
        this._refresh();
    },
    
    // refresh
    _refresh: function() {
        // selected
        var selected = this._getValue();
        
        // add select2 data
        this.$el.select2({
            data                : this.select_data,
            containerCssClass   : this.options.css,
            placeholder         : this.options.placeholder
        });
        
        // select previous value (if exists)
        this._setValue(selected);
    },
    
    // get index
    _getIndex: function(value) {
        // search index
        for (var key in this.select_data) {
            if (this.select_data[key].id == value) {
                return key;
            }
        }
        
        // not found
        return -1;
    },
    
    // get value
    _getValue: function() {
        return this.$el.select2('val');
    },
    
    // set value
    _setValue: function(new_value) {
        var index = this._getIndex(new_value);
        if (index == -1) {
            if (this.select_data.length > 0) {
                new_value = this.select_data[0].id;
            }
        }
        this.$el.select2('val', new_value);
    },
    
    // element
    _template: function(options) {
        return '<input type="hidden"/>';
    }
});

return {
    View : View
}

});