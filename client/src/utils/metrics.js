export function calculateMetrics(endpoint) {
  // Check for performance support
  if (performance === undefined) {
    console.log("Calculate Load Times: performance NOT supported");
    return;
  }

  // Get all PerformanceEntries of name === endpoint
  const endpointResources = performance.getEntriesByName(endpoint);
  // handle possibility of no matching resources
  if (endpointResources === undefined || endpointResources.length <= 0) {
    console.log(
      "Calculate Load Times: there are NO new `endpoint` performance records"
    );
    return;
  }

  // Access the most recent interaction with endpoint
  const lastResource = endpointResources.pop();

  // calculate the responseTime
  const responseTime =
    lastResource.fetchStart > 0
      ? lastResource.responseEnd - lastResource.fetchStart
      : "0";

  // assign lastResponseType by checking initiatorType.  Introspection === xmlhttprequest.
  const lastResponseType =
    lastResource.initiatorType === "xmlhttprequest" ? "Introspection" : "Query";

  return { responseTime: responseTime.toFixed(0), lastResponseType };
}
