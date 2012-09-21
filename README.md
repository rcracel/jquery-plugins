<h1>jQuery Plugins</h1>

<h2>Overview</h2>

<p>This is a collection of jQuery plugins I have created during my career as an engineer to help solve common day to day needs that I have noticed happening at every project I have ever worked on. This is my way of helping others who, like myself, find themselves spending countless hours trying to create or duplicate functionality widely available on the internet but often times unavailable as free standing libraries.</p>

<p>Please enjoy, and if you can, give back to the development community by submiting bug fixes and new features and documentation enhancements.</p>

<p>All plugins on this page require jQuery 1.7.1 or above</p>

<h2>Plugins</h2>

<dl>
    <dt>Griddy</dt>
    <dd>The griddy plugin allows you to add additional functionality to your data tables. A list of features available for this plugin is listed <a href="#griddy">here</a></dd>
    
    <dt>DynaTree</dt>
    <dd>The DynaTree plugin allows you to create dynamic trees (or lists) of items using a datasource of your choice. A list of features available for this plugin is listed <a href="#dynatree">here</a></dd>
</dl>

<hr />

<a href="griddy"></a>

<h2>Griddy</h2>

<h3>Overview</h3>

<p>Griddy has been tested on Google Chrome, Mozilla Firefox, Safari, and Internet Explorer 10</p>

<h3>Usage</h3>

<code>$("#myTable").griddy();</code>

<h3>Features</h3>

<ul>
    <li>Ability to tag table columns as being resizeable by adding a .resizeable class</li>
    <li>Logical resizing of columns will enlarge or shrink columns to the right leaving the columns to the left untouched</li>
    <li>Prevents text wrapping by hiding the overflow</li>
</ul>

<h3>Wish List</h3>

<ul>
    <li>Remember column widths on page reload by saving preferences on a cookie</li>
</ul>

<h3>Known Issues</h3>

<ul>
    <li>When tables get resized (browser window resize) the column widths should get updated</li>
    <li>Column resize cursor gets out of place when trying to resize past the minimum width for a given column</li>
    <li>Columns with multiple data elements need to be wrapped - for example, in a &lt;span&gt;&lt;/span&gt; to avoid formatting issues
</ul>

<a href="dynatree"></a>

<h2>DynaTree</h2>

<h3>Overview</h3>

<h3>Usage</h3>

<h3>Features</h3>

<ul>
    <li>Enables display of hierarchical data from a local or remote data source</li>
    <li>Customizeable through the use of callbacks and event handlers with support for data massaging</li>
    <li>Create editable trees that allow users to remove or add elements through a comprehensive API</li>
    <li>The use of a common layout for the tree layout enables further customization of the visual aspect of the tree through javascript</li>
</ul>

<h3>Wish List</h3>

<h3>Known Issues</h3>
