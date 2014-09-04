define(['mvc/ui/ui-portlet', 'mvc/ui/ui-misc',
        'mvc/citation/citation-model', 'mvc/citation/citation-view',
        'mvc/tools', 'mvc/tools/tools-template', 'mvc/tools/tools-datasets', 'mvc/tools/tools-section', 'mvc/tools/tools-tree'],
    function(Portlet, Ui, CitationModel, CitationView,
             Tools, ToolTemplate, ToolDatasets, ToolSection, ToolTree) {

    // create tool model
    var Model = Backbone.Model.extend({
        initialize: function (options) {
            this.url = galaxy_config.root + 'api/tools/' + options.id + '?io_details=true';
        }
    });

    // create form view
    var View = Backbone.View.extend({
        // base element
        main_el: 'body',
        
        // initialize
        initialize: function(options) {
            // link this
            var self = this;
            
            // link options
            this.options = options;
            
            // load tool model
            this.model = new Model({
                id : options.id
            });
            
            // creates a tree/json structure from the input form
            this.tree = new ToolTree(this);
            
            // reset field list
            this.field_list = {};
            
            // reset sequential input definition list
            this.input_list = {};
            
            // initialize datasets
            this.datasets = new ToolDatasets({
                success: function() {
                    self._initializeToolForm();
                }
            });
        },
        
        // initialize tool form
        _initializeToolForm: function() {
            // fetch model and render form
            var self = this;
            this.model.fetch({
                error: function(response) {
                    console.debug('tools-form::_initializeToolForm() : Attempt to fetch tool model failed.');
                },
                success: function() {
                    // inputs
                    self.inputs = self.model.get('inputs');
            
                    // create portlet
                    self.portlet = new Portlet.View({
                        icon : 'fa-wrench',
                        title: '<b>' + self.model.get('name') + '</b> ' + self.model.get('description'),
                        buttons: {
                            execute: new Ui.ButtonIcon({
                                icon     : 'fa-check',
                                tooltip  : 'Execute the tool',
                                title    : 'Execute',
                                floating : 'clear',
                                onclick  : function() {
                                    console.log(self.tree.create(self));
                                }
                            })
                        }
                    });
                    
                    // create message
                    self.message = new Ui.Message();
                    self.portlet.append(self.message.$el);
                    
                    // append form
                    $(self.main_el).append(self.portlet.$el);
                    
                    // append help
                    if (self.options.help != '') {
                        $(self.main_el).append(ToolTemplate.help(self.options.help));
                    }
                    
                    // append citations
                    if (self.options.citations) {
                        // append html
                        $(self.main_el).append(ToolTemplate.citations());
            
                        // fetch citations
                        var citations = new CitationModel.ToolCitationCollection();
                        citations.tool_id = self.options.id;
                        var citation_list_view = new CitationView.CitationListView({ collection: citations } );
                        citation_list_view.render();
                        citations.fetch();
                    }
                    
                    // configure portlet and form table
                    self.setElement(self.portlet.content());
                    
                    // create tool form section
                    self.section = new ToolSection.View(self, {
                        inputs : self.model.get('inputs')
                    });
                    
                    // append tool section
                    self.portlet.append(self.section.$el);
                    
                    // trigger refresh
                    self.refresh();
                }
            });
        },
        
        // refresh
        refresh: function() {
            // recreate tree structure
            this.tree.refresh();
            
            // trigger change
            for (var id in this.field_list) {
                this.field_list[id].trigger('change');
            }
            
            // log
            console.debug('tools-form::refresh() - Recreated tree structure. Refresh.');
        }
    });

    return {
        View: View
    };
});