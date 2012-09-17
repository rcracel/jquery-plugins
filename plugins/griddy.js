(function( $ ){

    $.fn.griddy = function( method ) {

        var version = "1.0.0", CONFIG = "griddy.config", DATA = "griddy.data",
            defaults = {
                edgeWidth: 2,
                minColWidth: 20
            },
            methods  = {
                init: function( options ) {
                    var config = $.extend( {}, defaults, options ),
                        data   = { columns: [] },
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
                        header.css({ width: header.width() + "px" });
                    });

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
                        if ( $(document).data( "table_resizing") ) { return; }

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

                            $(document).data( "table_resizing", table );

                            console.info("Start table resize...");
                            console.info( table.data( DATA ) );
                        }
                    });

                    if ( typeof console != "undefined" ) {
                        console.info( "Initialized Griddy widget " + version );
                    }

                    return this;
                },
                isHotSpot: function( x, y ) {
                    var head = $(this).find("thead"), config = $(this).data(CONFIG), cols = $(this).data( DATA )["columns"];

                    if (y >= head.offset().top && y <= head.offset().top + head.outerHeight( true )) {
                        for ( var i = 0 ; i < cols.length ; i++ ) {
                            var col = $(cols[i].object);

                            if ( (x >= (col.offset().left + col.outerWidth( true ) - config["edgeWidth"])) && (x <= (col.offset().left + col.outerWidth( true ) + config["edgeWidth"] ))) {
                                return cols[i];
                            }
                        }
                    }

                    return null
                },
                resizeColumn: function( offset, width ) {
                    var table   = $(this), tableOriginalSize = table.width(),
                        element = $(table.find("th")[ offset ]),
                        cols    = $.grep( table.data( DATA)["columns"], function( item ) { return item.offset > offset; }),
                        delta   = width - element.width();

                    width = Math.max( width, table.data( CONFIG ).minColWidth ); // ;

                    console.info("Setting width to " + width + "px");

                    element.css({ width: (width- parseInt( element.css("padding-left") ) - parseInt( element.css("padding-right") )) + "px" });

                    console.info("Width is now " + element.width() + "px");

//                    if ( table.width() > tableOriginalSize ) {
//                        var adjustedSize = width + table.width() - tableOriginalSize;
//                        element.css({ width: adjustedSize + "px" });
//
//                        console.info("Table too large... adjusting size to " + adjustedSize );
//                    }

//                    for( var i = 0 ; i < cols.length ; i++ ) {
//                        cols[i].object.css({
//                            width: cols[i].object.width() - (delta / cols.length)
//                        });
//                    }
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

})( jQuery );

$(function() {
    $(document).mousemove( function( event ) {
        var table = $(document).data("table_resizing");

        if ( table ) {
            var col      = table.data("griddy.data")["column"],
                delta    = event.pageX - table.data("griddy.data")["downAt"].x,
                newSize  = Math.max( col.width + delta, parseInt( col.object.css("min-width")) );

//            console.info("Original X : " + table.data("griddy.data")["downAt"].x );
//            console.info("Moved To X : " + event.pageX );
//
//            console.info("Original Size : " + col.width );
//            console.info("Resized Width : " + newSize + " ( " + col.width + " + " + delta + " )");

            table.griddy("resizeColumn", col.offset, newSize);
        }
    });

    $(document).mouseup( function( event ) {
        var table = $(document).data("table_resizing");

        if ( table ) {
            var col = table.data("griddy.data")["column"];

            $(document).data("table_resizing", null);

            col.width = col.object.width(); // - parseInt( col.object.css("padding-left") ) - parseInt( col.object.css("padding-right") );

//            table.griddy("resizeColumn", col.offset, col.width);
        }
    });
});