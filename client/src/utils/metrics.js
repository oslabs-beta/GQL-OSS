export function calculate_metrics() {
  console.log("running calculate_metrics");
  // Check for performance support
  if (performance === undefined) {
    console.log("Calculate Load Times: performance NOT supported");
    return;
  }

  // Get all PerformanceEntries of type 'Resources'
  const resources = performance.getEntriesByType("resource");
  // const allEntries = performance.getEntries();
  // console.log("resources:", resources);

  // Check for existing resources
  if (resources === undefined || resources.length <= 0) {
    console.log(
      "Calculate Load Times: there are NO new `resource` performance records"
    );
    return;
  }
  /*
  // Filter to show only PerformanceEntries to current endpoint
  const endpointResources = resources.filter(
    (resource) => resource.name === endpoint
  );
  */

  // console.log("allEntries:", allEntries);
  // console.log("endpointResources:", endpointResources);
  console.log("lastResource:", resources[resources.length - 1]);

  // // handle possibility of no resources
  // if (endpointResources === undefined || endpointResources.length <= 0) {
  //   console.log(
  //     "Calculate Load Times: there are NO new `endpoint` performance records"
  //   );
  //   return;
  // }

  // Access the most recent interaction with endpoint
  const lastResource = resources[resources.length - 1];
  console.log("lastResource:", lastResource);

  // calculate the queryTime
  const responseTime =
    lastResource.fetchStart > 0
      ? lastResource.responseEnd - lastResource.fetchStart
      : "0";

  const lastResponseType =
    lastResource.initiatorType === "xmlhttprequest" ? "Introspection" : "Query";

  return { responseTime, lastResponseType };
}
