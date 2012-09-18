(function( $ ){
    
    var CONFIG = "griddy.config", DATA = "griddy.data", DOC_FLAG = "griddy.table_resizing_state", DEVEL = true;

    $.fn.griddy = function( method ) {

        var version = "1.0.0"
            defaults = {
                edgeWidth: 2,
                minColWidth: 20
            },
            methods  = {
                init: function( options ) {
                    var config = $.extend( {}, defaults, options ),
                        data   = { columns: $([]) },
                        table  = $(this);

                    if ( typeof console != "undefined" ) {
                        console.info( "Initializing Griddy " + version );
                    }

                    table.data( CONFIG, config );
                    table.data( DATA, data );
                    
                    //- Record all resizeable columns
                    table.find("thead th").each( function( i ) {
                        var header = $(this);
                        if ( header.hasClass("resizeable") ) {
                            data["columns"].push({
                                name: header.text(),
                                width: header.width(),
                                object: header,
                                offset: i
                            });
                        }
                        header.width( header.width() );
                        header.html( $("<div />").append( header.html() ) );
                    });
                    data.tableWidth = table.width();

                    //- Add some extra styling to make the resize work as expected
                    table.find("td,th").css({
                        'overflow'   : "hidden",
                        'white-space': "nowrap"
                    });
                    table.find("thead tr").css({ height: "1em" });
                    table.find("tbody tr").css({ height: "1em" });
                    table.css({ "table-layout" : "fixed" });

                    //- Set the correct mouse pointer
                    table.mousemove( function( event ) {
                        if ( $(document).data( DOC_FLAG ) ) { return; }

                        if ( methods.isHotSpot.apply( this, [ event.pageX, event.pageY ] ) ) {
                            table.css("cursor", "col-resize");
                        } else {
                            table.css("cursor", "default");
                        }
                    });

                    //- Record a startResizing event
                    table.mousedown( function( event ) {
                        var col = methods.isHotSpot.apply( this, [ event.pageX, event.pageY ] );
                        if ( col ) {
                            event.preventDefault();

                            table.data( DATA )["downAt"] = { x: event.pageX, y: event.pageY };
                            table.data( DATA )["column"] = col;

                            $(document).data( DOC_FLAG, table );
                        }
                    });

                    if ( typeof console != "undefined" ) {
                        console.info( "Initialized Griddy widget " + version );
                    }

                    return this;
                },

                isHotSpot: function( x, y ) {
                    var head = $(this).find("thead"), config = $(this).data( CONFIG ), cols = $(this).data( DATA )["columns"];

                    if (y >= head.offset().top && y <= head.offset().top + head.outerHeight( true )) {
                        for ( var i = 0 ; i < cols.length ; i++ ) {
                            
                            var col   = $(cols[i].object),
                                left  = (col.offset().left + col.outerWidth( true ) - config["edgeWidth"]),
                                right = (col.offset().left + col.outerWidth( true ) + config["edgeWidth"] );

                            if ( (x >= left) && (x <= right)) { return cols[i]; }
                        }
                    }

                    return null;
                },

                resizeColumn: function( offset, width, debug ) {
                    var table            = $(this),
                        tableData        = table.data( DATA ),
                        headers          = table.find("thead th"),
                        element          = $( headers[offset] ),
                        delta, widths = [];
                        
                    //- Do not allow resizing the last header on the table, this will
                    //- cause issues as we won't know how to adjust the table overall
                    //- width...
                    if ( element.next() == null ) { return element.width(); }
                    
                    //- Respect the min width specified on the configuration
                    width = Math.max( width, table.data( CONFIG ).minColWidth );
                    
                    delta = width - element.width();

                    console.info( delta )
                    console.info( element.next().width() + " - " + delta + " < " + table.data( CONFIG ).minColWidth )
                    
                    if ( delta >= 0 && (element.next().width() - delta < table.data( CONFIG ).minColWidth )) { return element.width(); }
                    

                    element.next().width( element.next().width() - delta );
                    element.width( width );
                    
                    //- We need to update the column width for the current and next elements
                    table.data( DATA ).columns.each( function() {
                        if ( this.object.get(0) == element.get(0) ) { this.width = width; }
                        if ( this.object.get(0) == element.next().get(0) ) { this.width = element.next().width(); }
                    });

                    return width;
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




    }

    $(document).mousemove( function( event ) {
        var table = $(document).data( DOC_FLAG );

        if ( table ) {
            var col      = table.data( DATA ).column,
                delta    = event.pageX - table.data( DATA ).downAt.x,
                newSize  = col.width + delta;

            table.griddy("resizeColumn", col.offset, newSize);
            
            table.data( DATA ).downAt.x = event.pageX;
        }
    });

    $(document).mouseup( function( event ) {
        var table = $(document).data( DOC_FLAG );
        
        if ( table ) {
            var delta    = event.pageX - table.data( DATA ).downAt.x,
                col      = table.data( DATA ).column,
                newSize  = col.width + delta;

            col.width = table.griddy( "resizeColumn", col.offset, newSize, DEVEL );

            //- Clear out the state variables
            $(document).data( DOC_FLAG, null);
            
            table.data( DATA )["downAt"] = null;
            table.data( DATA )["column"] = null;
        }
    });

})( jQuery );
