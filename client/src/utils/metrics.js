export function calculate_metrics(endpoint) {
  // Check for performance support
  if (performance === undefined) {
    console.log("Calculate Load Times: performance NOT supported");
    return;
  }

  // Get a list all interations with the endpoint
  const resources = performance.getEntriesByName(endpoint);
  if (resources === undefined || resources.length <= 0) {
    console.log(
      "Calculate Load Times: there are NO `resource` performance records"
    );
    return;
  }

  // select the most recent interaction with the endpoint
  const mostRecentQuery = resources.pop();
  // console.log(mostRecentQuery);
  // calculate the queryTime
  const responseTime =
    mostRecentQuery.fetchStart > 0
      ? mostRecentQuery.responseEnd - mostRecentQuery.fetchStart
      : "0";
  // console.log(
  //   `Total query time for ${mostRecentQuery.name} - ${mostRecentQuery.initiatorType} (including queuing) = ${responseTime}`
  // );
  return { responseTime };
}
