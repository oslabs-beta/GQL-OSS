<!-- GRAPHQL-OSS README -->
<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/oslabs-beta/GQL-OSS">
    <img src="https://raw.githubusercontent.com/oslabs-beta/GQL-OSS/clark/readme/client/src/images/logo-bright.png" alt="Logo" width="250">
  </a>
  <h1 align="center"><b>GraphQL One Stop Shop</b></h1>
</p>

  <h2 align="center">
    A comprehensive GraphQL development tool that integrates editor-based request testing with live and dynamic visualization
    <br />
	<br />
  </h2>

<!-- BADGES -->
<div align="center">      
  <!-- LINK TO WEBSITE -->
  <i>Try it out!</i>
    <b><u><span><a href="https://www.graphql-oss.io/">
    GraphQL One Stop Shop</a>
    </span></u></b>
    <p><img src="https://img.shields.io/badge/dynamic/json?color=E10098&label=version&prefix=v&query=version&url=https%3A%2F%2Fraw.githubusercontent.com%2Foslabs-beta%2FGQL-OSS%2Fmain%2Fclient%2Fpackage.json"></p>
</div>

<hr>

<!-- TABLE OF CONTENTS -->
<details open="open">
<summary><b>Table of Contents</b></summary>
  <ol>
    <li><a href="#overview">Overview</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#endpoint">Endpoint</a></li>
    <li><a href="#code-editor">Editor</a></li>
    <li><a href="#schema-visualizer">Visualizer</a></li>
    <li><a href="#tech-stack">Technologies Used</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#meet-our-team">Meet our Team</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<hr>

## <a id="overview"></a><b>Overview</b>

<p align="left">
  GraphQL is a popular alternative to REST that has a rich and evolving ecosystem. Tools such as <a href="https://github.com/graphql/graphiql">GraphiQL</a> offer request testing in a code environment, while tools like <a href="https://github.com/IvanGoncharov/graphql-voyager">GraphQL Voyager</a> offer visualization of GraphQL schemas. <b>One Stop Shop</b> sets out to provide a streamlined developer experience by tightly coupling these two concepts into a single, integrated workflow. With OSS, simply enter a GraphQL API endpoint to receive an interactive visualization of the schema, build out requests in the editor with autocompletion and validation, and see all your changes dynamically reflected in the visualizer and response pane.  Real-time feedback, visual highlighting, and auto-regraphing enable fluid and intuitive navigation. In addition, OSS provides complete control over how much complexity is shown at any given time, with the ability to narrow down overwhelming API's to only their most relevant pieces. Customize your experience by utilizing numerous workflow modes such as 'Active Only,' 'Suggestions,' and even 'Reverse' which enables you to build out queries or mutations by interacting with nothing but the visualizer.
</p>
<br/>
<p align="center">
  <img  src="https://raw.githubusercontent.com/oslabs-beta/ReacTree/fabian/readme/src/media/navbar-controls.gif" width=90% >
</p>

---

## <a id="getting-started"></a><b>Getting Started</b>

Head to [graphql-oss.io](https://www.graphql-oss.io/) to try it out!
1) Set an endpoint (API URL, or local server)
2) Navigate your visualization
3) Build queries or mutations either through the editors or by interacting with the visualizer in Reverse Mode
4) Enjoy live and dynamic feedback in the visualizer and response pane
5) Experiment with different workflow modes to find your custom preferences
6) Have fun and build!
<br/>

---


## <a id="endpoint"></a><b>Endpoint</b>

Set your desired GraphQL API endpoint with the input at the top. This can be the URL of an API hosted on the web or a server running locally on your machine. If the endpoint is valid and accessible, OSS will autogenerate a balanced and proportionate directed-graph layout of the schema and connect the editors to the schema's syntax and structure.

**NOTE:** At this time, OSS does not auto refresh the schema. If you make any server-side changes to the API, “refresh endpoint” must be clicked to properly reflect the updates.

<p align="center">
  <img  src="https://raw.githubusercontent.com/oslabs-beta/ReacTree/fabian/readme/src/media/launch-props-open-files.gif" width=90% >
</p>

---

## <a id="code-editor"></a><b>Editor</b>

_The lefthand Editors of OSS allow you to build queries or mutations and view the data responses_

The top editor is the **Request Pane**, used for creating queries & mutations. As you type, all operations are checked against the schema for autocompletion and validation. By default, "live mode" is on, meaning queries will automatically submit as you type for real-time feedback. You may also execute an operation manually by clicking "submit" or typing ⌘/ctrl + ⮐.

<p align="center">
  <img  src="https://raw.githubusercontent.com/oslabs-beta/ReacTree/fabian/readme/src/media/navbar-controls.gif" width=90% >
</p>

<br/>

The bottom Editor is multi-purpose.

The “Results” tab displays the **Results Pane**, where response data from the API is displayed.

The “Variables” tab displays the **Variables Pane**, where variables can be entered in JSON format and will be automatically plugged in to the operation being executed. The variables pane is hooked into the Request pane for autocompletion and validation.

Upon successful response, performance metrics are displayed at the bottom.

<p align="center">
  <img  src="https://raw.githubusercontent.com/oslabs-beta/ReacTree/fabian/readme/src/media/themes.gif" width=90% >
</p>

<br/>



<br/>

Editor Features:

- **Copy Button** - Copies the contents of the current editor window disregarding preamble comments
- **Live Query Mode** (**_on_** | off) - Upon typing in the Request Pane, OSS validates and executes queries, updating results and visualizer highlighting in real time. Mutations are never automatically executed and require manual submission. If a query is not fully validated, it will not be sent to the API. However it may still be partially highlighted in the visualizer for guidance.
- **Reverse Mode** (on | **_off_**) - Build queries or mutations by clicking through valid routes to any level of nestedness in the visualizer itself. Turning on Reverse Mode will reset the state of your visualizer and data, while turning it off will persist it so you can fill out variables or continue building out requests after the fact. Collisions occur when fields that have multiple possible active routes are chosen, and can be resolved through the collision interface when triggered. You may only select fields with open active routes, and you must start building from Query/Root or Mutation.

**NOTE**: At this time, subscriptions are not supported.

---

## <a id="schema-visualizer"></a><b>Visualizer</b>

_The righthand Visualizer is a dynamic and interactive directed-graph representation of the current endpoint's schema._

Each Object Type from the Schema is represented as a _Type Node_ which contains all the _fields_ that belong to that Type. Relationships between Types and fields are rendered as arrows pointing from a field to its corresponding Object Type. Nodes are draggable and collapsible to suit your needs and preferences.

The **control panel** allows for easy zooming, centering, drag lock, and fullscreen control.

The **minimap** allows for easy navigation within the visualizer and highlights active nodes from a bird's eye view

The **display options panel** provides workflow modes and visualizer options:

- **Active Only** _(on | ***off***)_ - Only displays Type Nodes and Relationships that are currently active in the request pane
- **Suggestions** _(only available when Active Only is on)_ - Displays not only all active Type Nodes and Relationships, but also all nodes that are currently accessible from the furthest active nodes (leaves in the graph), effectively suggesting the next operational steps to be taken.
- **Auto Regraph** _(***on*** | off)_ - Automatically refreshes the visualizer layout to proportionate and balanced spacing when the active or visibility statuses change for nodes or edges.
- **Target Position** _( ***left*** | top )_ - Updates the location of the arrowhead pointing to each node.
- **Minimap** _(***on*** | off)_ - Toggles visualizer minimap
- **Controls** _(***on*** | off)_ - Toggles visualizer control panel
- **Color Selection** - Customize the colors of the visualizer
- **Collapse/Expand All** - Collapse / expand all nodes. An individual node can be collapsed or expanded by clicking on its header.
- **Regraph** - Manually refresh the visualizer layout to proportionate and balanced spacing at any given time.
---

## <a id="tech-stack"></a><b>Technologies Used</b>

- [React](https://reactjs.org/)
- [React Flow](https://reactflow.dev/)
- [ElkJS](https://github.com/kieler/elkjs)
- [Monaco-Editor](https://microsoft.github.io/monaco-editor/) w/ [GraphQL Plugin](https://www.npmjs.com/package/monaco-graphql)
- [Vite](https://vitejs.dev/)
- [GraphQL](https://graphql.org/)
- [React-Split](https://www.npmjs.com/package/react-split)
  <br/>
  <br/>

---



---

## <a id="contributing"></a><b>Contributing</b>

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Feel free to open tickets and start conversations around feedback or issues. All forks and suggestions are welcome - we'd love to collaborate with you!

If you like our application and find it useful, please consider starring our repo. This can help increase our overall impact and reach in the community, as well as attract more contributors and users. We'd greatly appreciate it!

[Report Bug / Request Feature](https://github.com/oslabs-beta/GQL-OSS/issues)

Or buy us a coffee to fuel further development

<a href="https://www.buymeacoffee.com/gacetta" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="30" width="130"></a>




<br/>

---

## <a id="meet-our-team"></a><b>Meet Our Team</b>

Developed with love by:

- Clark Pang • [LinkedIn](https://www.linkedin.com/in/clarkpang/) • [Github](https://github.com/clark-pang)
- Cole Bryan• [LinkedIn](https://www.linkedin.com/in/cnbryan/) • [Github](https://github.com/CNBryan129)
- Felipe Ocampo • [LinkedIn](https://www.linkedin.com/in/ocampofelipe/) • [Github](https://github.com/felipeaocampo)
- Michael Gacetta • [LinkedIn](https://www.linkedin.com/in/gacetta/) • [Github](https://github.com/gacetta)


 Check out out our <a href="">Medium article</a> for more information!


 Team [LinkedIn](https://www.linkedin.com/company/graphql-oss/)


<br/>

---

## <a id="license"></a><b>License</b>

<!-- Make sure to add license file to master branch -->

GraphQL One Stop Shop is developed under the [MIT license](https://github.com/oslabs-beta/FluxQL/blob/main/LICENSE)
