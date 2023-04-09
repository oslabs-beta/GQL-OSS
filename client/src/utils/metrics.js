export function calculate_metrics(endpoint) {
  console.log("running calculate_metrics.  endpoint:", endpoint);
  // Check for performance support
  if (performance === undefined) {
    console.log("Calculate Load Times: performance NOT supported");
    return;
  }

  // Get all PerformanceEntries of type 'Resources'
  const resources = performance.getEntriesByType("resource");
  // const allEntries = performance.getEntries();

  // Check for existing resources
  if (resources === undefined || resources.length <= 0) {
    console.log(
      "Calculate Load Times: there are NO new `resource` performance records"
    );
    return;
  }

  // console.log("resources:", resources);

  // Filter to show only PerformanceEntries to current endpoint
  const endpointResources = resources.filter(
    (resource) => resource.name === endpoint
  );

  // console.log("allEntries:", allEntries);
  // console.log("endpointResources:", endpointResources);
  console.log("lastResource:", resources[resources.length - 1]);

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
  console.log("lastEndpointInteraction:", lastEndpointInteraction);
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
