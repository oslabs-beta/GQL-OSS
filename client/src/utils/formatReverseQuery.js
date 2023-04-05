const newLineBefore = {
  "}": true,
};
const newLineAfter = {
  "{": true,
  ",": true,
};

// grabs query string produced by gql-query-builder
//would work also for mutation, but mutations not being
//accounted for yet. In order to make mutations and other
//input specific queries, Felipe believes vSchema needs to
//include variable specification, so that each field also
// knows the variables to expect
const formatReverseQuery = (reverseQueryStr) => {
  const length = reverseQueryStr.length;
  let numOfTabs = 0;
  const tab = `\t`;
  // console.log(reverseQueryStr);

  //iterate through received query string
  // add a new line (\n) after each opening curly brack and comma)
  // erase spaces before open curlys and before commas
  // add appropriate number of tabs (\t)
  let reformatedQuery = ``;
  for (let i = 0; i < length; i++) {
    const char = reverseQueryStr[i];
    if (newLineAfter[char]) {
      if (char === `{`) {
        //after every opening curly, increment num of tabs to get correct num of tabs
        numOfTabs++;
      }
      reformatedQuery += char + `\n${tab.repeat(numOfTabs)}`;
    } else if (newLineBefore[char]) {
      //decrement num of tabs to get proper tab length
      numOfTabs--;
      reformatedQuery += `\n${tab.repeat(numOfTabs)}` + char;
    } else if (char === ` `) {
      // in string input, some spaces are ok while others are not
      //spaces that should'nt be kept are always after opening curlys and after commas
      if (reverseQueryStr[i - 1] === `{` || reverseQueryStr[i - 1] === `,`) {
        reformatedQuery += ``;
      } else {
        reformatedQuery += char;
      }
    } else {
      reformatedQuery += char;
    }
  }

  reformatedQuery = reformatedQuery.replaceAll(`,`, ``);

  return reformatedQuery;
};

export default formatReverseQuery;
