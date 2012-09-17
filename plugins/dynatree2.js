/**
 *  jQuery DynaTree v2.0.0
 *
 *  expects data in the following format:
 *
 *  - [
 *      { id, label, children: [ ... ] }, ...
 *    ]
 *
 *  available options:
 *  - data: (optional) a json array containing the root nodes for the tree to be rendered. @see dataUrl.
 *  - dataUrl: (optional) an url to retrieve a json array containing the root nodes for the tree to be rendered.
 *    @see data.
 *  - id: (optional) the id of the tree container to be generated inside *this* element. If no id is supplied,
 *    __dynaroot is used.
 *  - initialState: (optional) the initial state of the tree nodes. This can be 'collapsed' or 'expanded'. It defaults
 *    to 'expanded'.
 *  - editable: (optional) whether or not the tree nodes can be removed from the tree by the user. When editable, the
 *    nooks will have carets allowing the user to delete the nodes. It defaults to false - non-editable.
 *  - children( element, value ): (optional) a function to resolve the children for a given element. This can be useful
 *    if the default 'children' property is not available immediately or if its under a different property. Can be used
 *    to retrieve an element children via ajax on demand. The default implementation expects there to be a 'children'
 *    property on the element. If the second parameter is specified this method will populate the children on the given
 *    element.
 *
 *  decorators:
 *  - label( element ): (optional) a function to resolve the label to be used when rendering the tree nodes. If no function is
 *    supplied the property 'name' will be used for each element of the tree.
 *
 *  available functions:
 *  - rootNodes(): returns all the root nodes for the tree.
 *  - selectNode( id ): selects the given node.
 *  - collapseNode( id ): collapses the given node if not already collapsed.
 *  - expandNode( id ): expands the given node if not already expanded.
 *  - toggleNode( id ): expands or collapses a given node depending on the current state of the node.
 *  - removeNode( id ): removed a node and all elements below the given node. It will also modify the array of elements.
 *  - addNodes( array ): merge the supplied tree - or single node - with the current tree. This method will find the
 *    lowest common node and append the newly supplied tree at that point. It does assume that the existing tree is
 *    complete up to its top most parent.
 *  - expandAll( id ): When invoked with no id, expands all elements of the entire tree. When invoked with an id,
 *    expands all children of given node identified by supplied id.
 *  - collapseAll( id ): When invoked with no id, collapses all elements of the entire tree. When invoked with an id,
 *    collapses all children of given node identified by supplied id.
 *
 *  events:
 *  - onInit( dataArray, options ): (optional) executed after the initialization of the tree is complete. If the tree is being
 *    initialized from an url, this method will be called after the data is loaded, parsed and rendered.
 *  - onAddNode( element, nook ):
 *  - onRemoveNode( element, nook ): (optional) a callback function to be invoked before a node is removed from the tree.
 *    If this callback returns false, the node is not removed.
 *  - onExpand( element, nook ): (optional) a callback function to be invoked when a parent node is expanded to show its
 *    children.
 *  - onSelect( element, nook, selected ): (optional) a callback function to be invoked when a node is selected.
 *
 * change log:
 * + 1.0.0
 *  - initial version
 * + 2.0.0
 *  - code refactored for consistency and easy of read
 *  - using jquery namespaces to allow invoking methods directly on the jquery object
 *
 */
(function( $ ){

    var version = "2.0.0", CONFIG = "dynatree.config", DATA = "dynatree.data";

    $.fn.dynaTree = function( method ) {
        var defaults = {
            //- Configuration defaults
            initialState: "expanded",
            editable    : false,
            data        : [],
            dataUrl     : null,
            //- Data callbacks
            label       : function( o ) { return o.name; },
            children    : function( o, value ) { if ( typeof value != "undefined" ) o.children = value; return o.children; },
            //- Events
            onExpand    : $.noop,
            onCollapse  : $.noop,
            onSelect    : $.noop,
            onInit      : $.noop,
            onAddNode   : $.noop,
            onRemoveNode: function( element, nook ) { return true; }
        },
            methods  = {
                init: function( options ) {
                    if ( typeof console != "undefined" ) {
                        console.info("Initializing DynaTree " + version );
                    }

                    //- Merge the configuration and store it on the tree object
                    var config = $.extend({
                        id: this.attr("id") + "_dynaroot"
                    }, defaults, options );

                    this.data( CONFIG, config );

                    //- Base containers for building the tree... building blocks!
                    var dynaContainer = $("<div id='" + config.id + "' class='dynatree_container'></div>"),
                        dynaList      = $("<ul id='" + config.id + "_branch' class='__dynatree __dynabranch'></ul>");

                    this.append( dynaContainer.append( dynaList ) );

                    if ( config.dataUrl != null ) {
                        var tree = this;
                        $.ajax({
                            url    : config.dataUrl,
                            success: function( data ) {
                                tree.data( DATA, data );
                                renderChildren( tree, data, 0, dynaList );
                                config.onInit( data, config );
                            },
                            failure: function() {
                                console.info("Could not initialize tree from url");
                            }
                        });
                    } else {
                        this.data( DATA, config.data );
                        renderChildren( this, config.data, 0, dynaList );
                        config.onInit.call( this, config.data );
                    }
                    if ( typeof console.info != "undefined" ) {
                        console.info("Initialized DynaTree widget # " + config.id + "version " + version);
                    }

                    return this;
                },
                rootNodes: function() {
                    return this.data(DATA);
                },
                findNook: function( id ) {
                    return this.find("div.nook[data-id='" + id + "']");
                },
                findElement: function( id ) {
                    var all = [],
                        found = null;

                    $.merge( all, this.data(DATA) );

                    while( all.length > 0 && found == null ) {
                        var current  = all.pop(),
                            children = this.data(CONFIG).children( current );

                        if ( current.id == id ) {
                            found = current;
                        } else {
                            if ( children != null ) { $.merge( all, children ); }
                        }
                    }

                    return found;
                },
                selectNode: function( id ) {
                    var tree    = this,
                        nook    = this.dynaTree("findNook", id ),
                        element = this.dynaTree("findElement", id );

                    if ( !nook.hasClass("selected") ) {
                        nook.addClass("selected");
                        this.data(CONFIG).onSelect( element, nook, true );
                    }

                    if ( nook.siblings("i").hasClass("expandable") ) {
                        this.dynaTree("expandNode", id );
                    }

                    tree.find("div.nook").each( function( i, o ) {
                        if ( $(o).attr("data-id") != id && $(o).hasClass("selected") ) {
                            $(o).removeClass("selected");
                            tree.data(CONFIG).onSelect( tree.dynaTree("findElement", $(o).attr("data-id") ), nook, false );
                        }
                    });
                },
                collapseNode: function( id ) {
                    var nook = this.dynaTree("findNook", id ), o = this.dynaTree("findElement", id );
                    nook.siblings("ul").hide();
                    nook.siblings("i").addClass("collapsed");
                    this.data(CONFIG).onCollapse(o,nook);
                },
                expandNode: function( id ) {
                    var nook = this.dynaTree("findNook", id ), o = this.dynaTree("findElement", id );
                    nook.siblings("ul").show();
                    nook.siblings("i").removeClass("collapsed");
                    this.data(CONFIG).onExpand(o,nook);
                },
                toggleNode: function( id ) {
                    var nook = this.dynaTree("findNook", id );
                    if ( nook.siblings("i").hasClass("collapsed") ) {
                        this.dynaTree("expandNode", id );
                    } else {
                        this.dynaTree("collapseNode", id );
                    }
                },
                removeNode: function( id ) {
                    var nook = this.dynaTree("findNook", id ), element = this.dynaTree("findElement", id );
                    if ( this.data(CONFIG).onRemoveNode( element, nook ) != false ) {
                        var all = [];

                        //- Delete the element from the tree
                        this.data(DATA, $.grep( this.data(DATA), function( value ) { return value.id != id; }));

                        $.merge( all, this.data(DATA) );
                        while( all.length > 0 ) {
                            var current  = all.pop(),
                                children = this.data(CONFIG).children( current ), childrenNew;

                            if ( typeof children != "undefined" && children != null && children.length != 0 ) {
                                childrenNew = $.grep( children, function( value ) { return value.id != id; });

                                if ( children.length != childrenNew.length ) {
                                    this.data(CONFIG).children( current, childrenNew );
                                } else {
                                    $.merge( all, children );
                                }
                            }
                        }

                        //- Delete the visuals
                        var parent = $(nook.parent()), grandpa = $(parent).parent();
                        if ( grandpa.children().length == 1 ) {
                            grandpa.siblings("i").removeClass("expandable");
                        }
                        parent.remove();
                    }
                },
                expandAll: function( id ) {
                    var root;
                    if ( id == null || id == "undefined" ) {
                        root = this.dynaTree("rootNodes");
                    } else {
                        root = [ this.dynaTree("findElement", id ) ];
                    }
                    $( root ).each( function( i, o ) {
                        var children = this.data(CONFIG).children( o );
                        if ( children != null && children.length != 0 ) {
                            this.dynaTree("expandNode", o.id );
                            $(children).each( function( ii, oo ) {
                                this.dynaTree("expandAll", oo.id );
                            });
                        }
                    });
                },
                collapseAll: function( id ) {
                    var root;
                    if ( id == null || id == "undefined" ) {
                        root = this.dynaTree("rootNodes");
                    } else {
                        root = [ this.dynaTree("findElement", id ) ];
                    }
                    $( root ).each( function( i, o ) {
                        var children = this.data(CONFIG).children( o );
                        if ( children != null ) {
                            this.dynaTree("collapseNode", o.id );
                            $(children).each( function( ii, oo ) {
                                this.dynaTree("collapseAll", oo.id );
                            });
                        }
                    });
                },
                addNodes: function( elements ) {
                    var paths = pathsFor( this, elements ), tree = this;

                    $(paths).each( function( i, path ) {
                        var container, insertIndex = mergePath( tree, path );
                        if ( insertIndex >= 0 ) {
                            if ( insertIndex == 0 ) {
                                container = tree.find( "#" + tree.data(CONFIG).id + " > ul" );
                            } else {
                                var nook = tree.dynaTree("findNook", path[ insertIndex - 1 ].id );
                                container = nook.siblings("ul");
                                nook.siblings("i").addClass("expandable");
                            }

                            renderChildren( tree, [ path[ insertIndex ] ], insertIndex, container );
                        }
                    });
                }
            };

        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.griddy' );
        }


        /**
         * createNode
         *
         * @param tree
         * @param container the container where the list item is to be placed
         * @param object    the data item for which we are creating the new list item
         * @param level     the level offset
         * @return {*}
         */
        function createNode( tree, container, object, level ) {
            var $container = $(container),
                options    = tree.data(CONFIG),
                nook       = $("<div class='nook' data-id='" + object.id + "'>" + options.label( object ) + "</div>").addClass("level_" + level),
                caret      = $("<i class='caret'></i>"),
                item       = $("<li></li>").addClass("__dynatree __dynanode").append(caret).append( nook );

            $container.append( item );

            if ( options.editable == true ) {
                var close = $("<i class='caret-close'>x</i>").click(function() { tree.dynaTree( "removeNode", object.id ) });
                nook.append( close );
            }

            nook.click(function() {
                tree.dynaTree( "selectNode", object.id );
            });

            options.onAddNode.call( this, object, nook );

            return item;
        }

        /**
         * renderChildren
         *
         * @param tree
         * @param children    a collection of children to be added to the tree
         * @param level       the level to be used when recursively rendering the tree nodes, should be left null fo all initial calls
         * @param container   a subcontainer to be used to recursively create the tree, should be left null for all initial calls
         * @return {*}
         */
        function renderChildren( tree, children, level, container ) {
            //- Deal with defaults
            if ( typeof level == "undefined" ) { level = 0 }
            if ( typeof container == "undefined" ) { container = tree }

            return $(children).each( function( i, object ) {
                var createdItem = createNode( tree, container, object, level ),
                    options     = tree.data(CONFIG);

                if ( typeof options.children(object) != "undefined" && options.children(object).length != 0 ) {
                    var $subContainer = $("<ul></ul>").addClass("__dynatree __dynabranch");

                    createdItem.children("i").addClass("expandable")
                        .mouseenter(function() { $(object).addClass("hover") })
                        .mouseleave(function() { $(object).removeClass("hover") })
                        .click(function( event ) {
                            tree.dynaTree("toggleNode", object.id );
                            event.preventDefault();
                        });

                    if ( options.initialState == "collapsed" ) {
                        createdItem.children("i").addClass("collapsed");
                        $subContainer.hide();
                    }

                    createdItem.append( $subContainer );

                    renderChildren( tree, options.children(object), level + 1, $subContainer );
                }
            });
        }

        /**
         * Converts a collection of objects into a collection of object paths such as every 'leaf' of a given tree-like
         * structure will be depicted by a array of objects containing all elements up to its topmost parent. The leaf
         * object will be the first element of the array, while the top-most parent will be the last element of
         * the array.
         *
         * @param  {Array|Object} array the array or element for which we need to compute the path
         * @param  {Array}        [currentPath] the current path to be used to recursively
         * @return {Array}
         */
        function pathsFor( tree, array, currentPath ) {
            var result = [];

            if ( currentPath == null || typeof currentPath == "undefined" ) { currentPath = []; }
            if ( $.isArray( array ) == false ) { array = [ array ]; }

            $( array ).each( function( i, o ) {
                var children = tree.data(CONFIG).children( o ), localPath = currentPath.slice();

                localPath.push( o );

                if ( children == "undefined" || children == null || children.length == 0 ) {
                    result.push( localPath );
                } else {
                    $.merge( result, pathsFor( children, localPath ));
                }
            });

            return result;
        }

        /**
         *
         * @param   {Array}  path the path to be merged.
         * @param   {int}    [index] the index of the path currently being analyzed
         * @param   {Array}  [currentCollection] the location on the current collection, used to recursively compute merge
         * @returns {int}    The index where the trees were merged, or -1 if the trees fully overlap
         */
        function mergePath( tree, path, index, currentCollection ) {
            var path_index = (typeof index == "undefined") ? 0 : index,
                current    = path[ path_index ],
                local      = tree.dynaTree("findElement", current.id);

            if ( currentCollection == null ) { currentCollection = tree.data(DATA) }

            if ( local != null ) {
                //- Return -1 if we are at the end of the path
                if ( path_index + 1 == path.length ) { return -1; }

                //- Make sure we have a placeholder for children
                if ( typeof tree.data(CONFIG).children( local ) == "undefined" ) { tree.data(CONFIG).children( local, [] ) }

                //- Continue merging
                return mergePath( tree, path, path_index + 1, tree.data(CONFIG).children( local ) );
            } else {
                //- Merging point found, merge and return the index
                currentCollection.push( current );
                return path_index;
            }
        }
    }

})( jQuery );