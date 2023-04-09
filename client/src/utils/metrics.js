export function calculate_metrics(endpoint) {
  console.log("running calculate_metrics");
  // Check for performance support
  if (performance === undefined) {
    console.log("Calculate Load Times: performance NOT supported");
    return;
  }

  // Get all PerformanceEntries of type 'Resources'
  const resources = performance.getEntriesByType("resource");
  const allEntries = performance.getEntries();

  // Check for existing resources
  if (resources === undefined || resources.length <= 0) {
    console.log(
      "Calculate Load Times: there are NO new `resource` performance records"
    );
    return;
  }

  // Filter to show only PerformanceEntries to current endpoint
  const endpointResources = resources.filter(
    (resource) => resource.name === endpoint
  );

  // console.log("allEntries:", allEntries);
  console.log("endpointResources:", endpointResources);

  // handle possibility of no resources
  if (endpointResources === undefined || endpointResources.length <= 0) {
    console.log(
      "Calculate Load Times: there are NO new `endpoint` performance records"
    );
    return;
  }

  // Access the most recent interaction with endpoint and remove it from endpointResources array
  // const lastEndpointInteraction = endpointResources.pop();
  // Access the most recent interaction with endpoint
  const lastEndpointInteraction =
    endpointResources[endpointResources.length - 1];
  console.log(lastEndpointInteraction);
  // calculate the queryTime
  const responseTime =
    lastEndpointInteraction.fetchStart > 0
      ? lastEndpointInteraction.responseEnd - lastEndpointInteraction.fetchStart
      : "0";

  const lastResponseType =
    lastEndpointInteraction.initiatorType === "xmlhttprequest"
      ? "Introspection"
      : "Query";

  return { responseTime, lastResponseType };
}

// make a request
// those request performance metrics are stored in performance object
// find the request to a specific endpoint
// calc the time of that request using responseEnd - fetchStart

/*
Filter all requests
- get all requests of type === 'resource'
- filter by name === endpoint
- if initiatorType === 'xmlhttprequest',  'Introspection'
- if initiatorType === 'fetch', 'Query'
- 'Mutation'?
*/
