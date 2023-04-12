<!-- GRAPHQL-OSS README -->
<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/oslabs-beta/ReacTree">
    <img src="https://raw.githubusercontent.com/oslabs-beta/GQL-OSS/dev/client/src/images/logo4.png" alt="Logo" width="250">
  </a>
  <h1 align="center"><b>GraphQL One Stop Shop</b></h1>
</p>

  <h2 align="center">
    A comprehensive GraphQL development tool with integrated code editor and schema visualizer.
    <br />
    <br />
  </h2>

<!-- BADGES -->
<div align="center">      
  <!-- LINK TO WEBSITE -->
  Visit
    <b><u><span><a href="https://marketplace.visualstudio.com/items?itemName=ReacTreeDev.reactree">
    The GraphQL One Stop Shop</a>
    </span></u></b>
    <p><img src="https://img.shields.io/visual-studio-marketplace/v/reactreedev.reactree"></p>
</div>

<hr>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#overview">Overview</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#endpoint">Endpoint</a></li>
    <li><a href="#editor">Code Editor</a></li>
    <li><a href="#visualizer">Schema Visualizer</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#article">Article</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#meet-our-team">Meet our Team</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<hr>

## <b>Overview</b>

---

<p align="left">
  GraphQL is a popular alternative to REST with several solid development tool options.  Some tools, such as <a href="https://github.com/graphql/graphiql">GraphiQL</a>, help with the generation & testing of queries and mutations, while others, such as <a href="https://github.com/IvanGoncharov/graphql-voyager">GraphQL Voyager</a>, allow users to visualize schema for convenient API navigation. The GraphQL One Stop Shop team set out to build a comprehensive GraphQL development tool to consolidate these functionalities into a single application.  OSS provides a development environment with integrated visual and query feedback in real time as a query / mutation is typed in the code editor field.
</p>
<br/>
<p align="center">
  <img  src="https://raw.githubusercontent.com/oslabs-beta/ReacTree/fabian/readme/src/media/navbar-controls.gif" width=90% >
</p>

---

## <b>Getting Started</b>

Head to <a href="https://marketplace.visualstudio.com/items?itemName=ReacTreeDev.reactree">
GraphQL-oss.io</a> to visit the one stop shop.
<br/>

---

## <b>Endpoint</b>

_The top portion of the application is used to set the GraphQL endpoint_

---

Enter the desired GraphQL API endpoint and click “set endpoint”. This can be the URL of an API hosted on the web or a development server running at a localhost address. The schema should load and auto generate a layout.

**NOTE:** OSS does not auto refresh the schema at this time. If you make any server-side changes to the API, the “refresh endpoint” button must be clicked to properly reflect the updates.

<p align="center">
  <img  src="https://raw.githubusercontent.com/oslabs-beta/ReacTree/fabian/readme/src/media/launch-props-open-files.gif" width=90% >
</p>

---

## <b>Code Editor</b>

_The left portion of the application is used for generating queries/mutations and viewing the data responses_

---

<u>The top editor is The Request Pane</u>, used for creating queries & mutations. As the user types in a query, an auto-complete feature checks for valid fields that match the schema. A query can also be sent by clicking the “submit” button or using ⌘+⮐ cmd+enter ctrl+enter.

<p align="center">
  <img  src="https://raw.githubusercontent.com/oslabs-beta/ReacTree/fabian/readme/src/media/navbar-controls.gif" width=90% >
</p>

<br/>

The bottom editor serves several purposes:

- <u>The “Results” tab displays The Results Pane</u>, where response data from the API is displayed.

- <u>The “Variables” tab switches to The Variables Pane</u>, which allows for variable use in the Request Pane above.

<p align="center">
  <img  src="https://raw.githubusercontent.com/oslabs-beta/ReacTree/fabian/readme/src/media/themes.gif" width=90% >
</p>

<br/>

Performance metrics are displayed below these editors upon a successful response.

<br/>

Editor Features:

- **Copy Button** - when clicked, copies the contents of the current editor window
- **Live Query Mode** _(<u>**on**</u> | off)_ - upon typing in the Request Pane, the OSS constantly validates and sends requests to API, updating results and visualizer highlighting in real time.
- **Reverse Mode** _(on | <u>**off**</u>)_ - When engaged, allows for generation of a query / mutation by clicking on the schema.

**NOTE**: At this time, subscriptions are not supported.

---

## <b>Schema Visualizer</b>

_The right portion of the application displays an interactive representation of the schema at the current endpoint._

---

Each Object Type from the Schema is represented as a node which contains all the fields that belong to that type. Relationships are rendered as arrows pointing from fields to their corresponding Object Type. Nodes are draggable and collapsable for a highly customizable environment.

<u>A control panel</u> allows for easy zooming, centering, drag lock and fullscreen control.

<u>A minimap</u> allows for easy navigation within the visualizer

<u>A collapsable display options panel</u> provides more visualizer options:

- **Active Only** _(on | <u>**off**</u>)_ - Only displays Nodes and Relationships that are currently “active” in the request pane
- **Suggestions** _(only available in Active Only)_ - Displays “inactive” Nodes that have a relationship to the “active” nodes
- **Auto Regraph** _(<u>**on**</u> | off)_ - Updates the visualizer layout when the rendered nodes change, i.e. when a new “active” node is added
- **Target Position** _( <u>**left**</u> | top )_ - Updates the location of the arrowhead pointing to each node.
- **Minimap** _(<u>**on**</u> | off)_ - Toggles visualizer minimap
- **Controls** _(<u>**on**</u> | off)_ - Toggles visualizer control panel
- **Color Selection** - Customize the colors of the visualizer
- **Collapse/Expand All** - collapse / expand all nodes
- **Regraph** - Resets the graph layout

---

## <b>Tech Stack</b>

---

- [React](https://reactjs.org/)
- [React Flow](https://reactflow.dev/)
- [React-Split](https://www.npmjs.com/package/react-split)
- [GraphQL](https://graphql.org/)
- [Monaco-Editor](https://microsoft.github.io/monaco-editor/) w/ [GraphQL Plugin](https://www.npmjs.com/package/monaco-graphql)
- [ElkJS](https://github.com/kieler/elkjs)
- [Vite](https://vitejs.dev/)
  <br/>
  <br/>

---

## <b>Article</b>

Checkout out our <a href="">medium article</a> for more information about the GraphQL One Stop Shop!

<br/>

---

## <b>Contributing</b>

---

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Get started with GraphQL OSS at https://www.graphql-oss.io/. And connect with us on <a href="">LinkedIn</a>.

Additionally, you can find the project’s source code, documentation, and issue tracker in [Github]("https://github.com/oslabs-beta/GQL-OSS"). You can also fork the project, make changes, and submit pull requests to help improve the project.

If you like the project and find it useful, please consider giving it a star on GitHub. This can help increase visibility for the project and attract more contributors and users.

Or buy us a coffee to fuel further development

<a href="https://www.buymeacoffee.com/gacetta" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="30" width="130"></a>

  <p align="left">
      <br />
      <a href="https://github.com/oslabs-beta/GQL-OSS/issues">Report Bug / Request Feature</a>
  </p>
<br/>

---

## <b>Meet Our Team</b>

- Clark Pang • [LinkedIn](https://www.linkedin.com/in/fabian-salazar-260a7957/) • [Github](https://github.com/fsalazar88)
- Cole Bryan• [LinkedIn](https://www.linkedin.com/in/michaelbenliyan/) • [Github](https://github.com/MichaelBenliyan)
- Felipe Ocampo • [LinkedIn](https://www.linkedin.com/in/briannohski/) • [Github](https://github.com/dogenoh)
- Michael Gacetta • [LinkedIn](https://www.linkedin.com/in/gacetta/) • [Github](https://github.com/gacetta)

<br/>

---

## <b>License</b>

<!-- Make sure to add license file to master branch -->

GraphQL One Stop Shop is developed under the [MIT license](https://github.com/oslabs-beta/FluxQL/blob/main/LICENSE)
