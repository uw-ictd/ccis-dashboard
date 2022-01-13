Good code checklist:
* [ ] 1. API boundaries, separation of modules/functions
* [ ] 2. Simplicity, statefulness, and functional programming
* [ ] 3. Documentation
* [ ] 4. Appropriate tests
* [ ] 5. Formatting

# 1. API boundaries, separation of modules/functions
You can think of each function or module as having an API, but there are three main interfaces to focus on in this application: the frontend, the backend, and the config files.

* The `config/` files are where all deployment-specific details should go, and they should *only* have deployment-specific details. They should be especially well-documented, since this is the part we expect deployment architects to modify.
* The frontend and backend code communicate only through HTTP requests. This separation gives a natural way to test one without the other, so that interface should remain as stable as possible.

Modules and functions should be kept short, with a limited, easy-to-understand scope. A module longer than ~150 lines is large. At the time of writing, the largest module in the codebase (excluding CSS and config files) is `chartDrawer.js` at 298 lines: modules of this size should be broken up into smaller pieces with the goal of facilitating testing and future maintenance.

Follow the DRY (Don't Repeat Yourself) principle carefully everywhere except the config files. Writing modules with many small functions is generally the way to do this.

# 2. Simplicity, statefulness, and functional programming
Shorter code is easier to maintain. If there is a shorter, simpler way to achieve the same result, it is highly preferred. Often, switching from a stateful, imperative paradigm to a functional one can achieve this. Stateful code local to a single function is less bad and easier to fix than state that persists for a long time, but on rare occasion it may be necessary on the frontend to maintain some global state that parallels the DOM. Red flags that indicate stateful logic:
* Modifying an object. Instead, creating a new object is less error-prone.
* Modifying an array (e.g. `.push` or `.pop`). The array methods `.map`, `.filter`, and `.reduce` can likely do the same thing more simply
* Use of the `let` keyword, especially with something like `+=`. `let` isn't always bad, since sometimes the alternative is the trinary operator, which can get very hard to read

For example, consider the following change, from:

```
function getNonZeroOptions(data) {
    const nonZero = new Set();
    data[0][1].forEach(arr => {
        const values = arr[1];
        Object.keys(values).filter(option => values[option] > 0).forEach(option => nonZero.add(option));
    });
    const result = []
    nonZero.forEach(d => result.push(d));
    return result;
}
```

to the shorter and state-free:

```
function getNonZeroOptions(data) {
    const nonZero = new Set(
        data.flatMap(([repeatlabel, subChartData]) => subChartData)
            .flatMap(temp => Object.keys(temp[1]).filter((option) => temp[1][option] > 0)));
    return [...nonZero];
}
```

# 3. Documentation
Documentation comes in many places. The first and most important is naming variables, functions, and modules/files. In a simple module with very clear naming, this might be all that is necessary (aka "self-documenting" code). For complicated code, comments at the sites of possible confusion can be very helpul. More detailed comments describing behavior of a key function or module are especially valuable. See for instance the comments on the functions in `chartDrawer.js` and `queryTemplate.js` that come with examples of input and output formats. Documentation in the config files is crucial, like the detailed comment at the top of `visualizations.js`.

# 4. Appropriate tests
Ideally, every line of code in the codebase will be executed by some test (complete "code coverage"), and ideally every bug fixed will come with a regression test that will error if the bug re-appears. The current state of our testing does not live up to this ideal, but we should work towards it. There are, broadly, three types of tests:
* Unit tests run a single module with no/limited dependencies
* Integration tests test the behavior of a module in interaction with other code/modules. For example, code that generates SQL queries is tested against a real SQL database, and code that tests the backend API runs the entire server stack
* End-to-end (E2E) tests run the frontend and backend together and test how the application behaves using a browser (with selenium web driver).

Unit tests are preferred over integration tests, which are preferred over end-to-end tests. Try to write code that does not require integration/end-to-end tests.

The one downside to having a robust set of tests is "brittleness": how much you have to go back and edit the tests when you change the code. To limit brittleness, end-to-end tests should be the most lenient (e.g. when seeing if a visualization works, check that any SVG appeared, not that the parts of the svg have the right colors) and unit tests should be the most strict.

# 5. Formatting
The codebase has a mostly consistent set of formatting choices, and we should try to keep it consistent. Look at the surrounding code style and match that.
Some of this includes:
* `camelCase` in javascript, `snake_case` in HTML, `CAPITAL_CASE` for constants like `MIN_RADIUS = '5px'`
* Indent with 4 spaces (not tabs)
* No trailing whitespace, no blank lines at the beginning/end of files
* Blank lines between functions are required, blank lines within functions only for long functions
* `{ foo: 1 }`, not `{foo:1}`. `[ 1, 2, 3 ]`, not `[1,2,3]`
* This is semantics, not formatting, but never use `let` where `const` will work
* `function(arg) {`, not `function (arg) {`
* `foo.map(x => x + 1)` not `foo.map((x) => x + 1)`
* `foo.map(bar)`, not `foo.map(x => bar(x))`, with the important caveat that sometimes the second one is necessary, since it can in rare cases have different behavior
* `module.exports = ...` goes at the very end of the file. The exception is for something like a config file where the entire file is just defining a single object/function that is then exported.
* Usually, use
  ```
  const obj = {
      foo: 1,
      bar: 2
  };
  ```
  Not:
  ```
  const obj = { foo: 1,
                bar: 2 };
  ```
