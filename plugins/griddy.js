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
                        data   = { columns: [] },
                        table  = $(this);

                    if ( typeof console != "undefined" ) {
                        console.info( "Initializing Griddy " + version );
                    }

                    table.data( CONFIG, config );
                    table.data( DATA, data );
                    
//                    table.width( "auto" );

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
                            
                            if ( DEVEL ) {
                                console.info( "Mouse down at " + event.pageX + " x " + event.pageY );
                            }
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
                    var table        = $(this), tableOriginalSize = table.width(),
                        element      = table.find("th").eq( offset ),
                        cols         = $.grep( table.data( DATA )["columns"], function( item ) { return item.offset > offset; }),
                        reqWidth     = width,
                        origWidth    = element.width(),
                        delta        = width - origWidth,
                        leftPadding  = parseFloat( element.css("padding-left") )       || 0,
                        rightPadding = parseFloat( element.css("padding-right") )      || 0,
                        leftBorder   = parseFloat( element.css("border-left-width") )  || 0,
                        rightBorder  = parseFloat( element.css("border-right-width") ) || 0,
                        leftMargin   = parseFloat( element.css("margin-left") )        || 0,
                        rightMargin  = parseFloat( element.css("margin-right") )       || 0;

                    width -= leftPadding;
                    width -= rightPadding;
                    
                    width -= leftBorder;
                    width -= rightBorder;
                    
                    width -= leftMargin;
                    width -= rightMargin;

                    //- Respect the min width specified on the configuration
                    width = Math.max( width, table.data( CONFIG ).minColWidth );

                    if ( debug ) {
                        console.info("");
                        console.info("#######################################");
                        console.info("Requested width was " + reqWidth + "px");
                        console.info("Setting width to " + width + "px");
                    }

                    element.width( width );
                    // 
                    // width = element.width();
                    // 
                    // if ( debug ) {
                    //     console.info("Width [raw]   is now " + width + "px");                        
                    //     
                    //     console.info(" --- ");
                    // 
                    //     console.info("Left Padding  " + leftPadding);
                    //     console.info("Right Padding " + rightPadding);
                    //     console.info("Left Border   " + leftBorder);
                    //     console.info("Right Border  " + rightBorder);
                    //     console.info("Left Margin   " + leftMargin);
                    //     console.info("Right Margin  " + rightMargin);
                    //     console.info("------------> " + (leftPadding+rightPadding+leftBorder+rightBorder+leftMargin+rightMargin));
                    //     
                    //     console.info(" --- ");
                    // 
                    //     console.info("Width [outer] is now " + element.outerWidth() + "px");
                    //     console.info("Width [inner] is now " + element.innerWidth() + "px");                        
                    // }

                    var tableGrowth = table.width() - tableOriginalSize;
                    if ( tableGrowth > 0 ) {
                        
                        element.width( origWidth );
                    } else if ( tableGrowth < 0 ) {
                        var target = element.next();
                        
                        if ( target ) {
                            target.width( target.width() - delta );
                        } else {
                            element.width( origWidth );
                        }
                    }

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
        }
    });

    $(document).mouseup( function( event ) {
        var table = $(document).data( DOC_FLAG );
        
        if ( table ) {
            var delta    = event.pageX - table.data( DATA ).downAt.x,
                col      = table.data( DATA ).column,
                newSize  = col.width + delta;

            if ( DEVEL ) {
                console.info( "Mouse up at " + event.pageX + " x " + event.pageY + " w= " + col.width + "px");
            }

            col.width = table.griddy( "resizeColumn", col.offset, newSize, DEVEL );

            //- Clear out the state variables
            $(document).data( DOC_FLAG, null);
            
            table.data( DATA )["downAt"] = null;
            table.data( DATA )["column"] = null;
        }
    });

})( jQuery );
