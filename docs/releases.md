Release checklist
* [ ] 1. Update the dependencies
* [ ] 2. Manual test
* [ ] 3. Update the dependency graphs
* [ ] 4. Bump the version number
* [ ] 5. Tag the commit
* [ ] 6. Publish publicly to github

# 1. Update the dependencies
The `package.json` file specifies the desired version of each dependency, usually with a syntax like `^1.3.4`, where the caret means "at least this version, but the minor version number (the third one) can be higher. This is using semantic versioning. Since that leaves some flexibility and also does not specify which versions of our dependencies' dependencies are used, `package-lock.json` gives all this information for reproducible builds.

Optional: update dependencies to the very latest version with `npm i package-name`. This will update both package.json and package-lock.json. This may cause breaking changes to our code, which is why it is optional

Required: run `npm update` to update all dependencies to the latest *minor* version. 

Run `npm audit` to check for any reported vulnerabilities in our dependencies, and update those packages to resolve the vulnerabilities. Sometimes the vulnerability is in a dependency of a dependency, and we have to wait for that package maintainer to update their package. In the event that there is a vulnerability like this we cannot fix immediately, we should evaluate the threat to our application's security before going ahead with the release.

# 2. Manual test
Run the dashboard locally and check that it is generally working as expected. Export some data, load one visualization of each type, check any recently added features and recently fixed bugs.

# 3. Update the dependency graphs
Run `npm run dependency-graph` to update the dependency graphs in the documentation. This requires that you have graphviz installed (https://graphviz.org),

# 4. Bump the version number
Edit the version number in `package.json`. Increase one of the version numbers based on how substantial the changes are. Then, run `npm i` to update the version number in `package-lock.json` also.

Since this is a complete end-user application, not a library that other developers will use, using semantic versioning is not necessary. Instead, the version numbers are for communicating with users and other stakeholders what sort of change the dashboard is seeing.
For routing maintenance and gradual feature additions, update the third number. For substantial new features (e.g. a new tab that can do a totally new thing), increase the second number. For major overhauls of the code or the UI, increase the first number.

# 5. Tag the commit
* Commit this all of thsee changes in a commit named with the version number. See `git show v1.1.3` for an example.
* Optionally, add release notes to the commit message summarizing the changes since the prior release.
* Add an *annotated* tag with the version number to that commit (see [here](https://stackoverflow.com/questions/11514075/what-is-the-difference-between-an-annotated-and-unannotated-tag) for more on annotated vs. lightweight tags). The annotation can also be the version number.
```
git tag -a -m "v1.1.3" v1.1.3
```
* Push your changes and the tag with `git push --follow-tags`. This will push all annotated tags on this commit or any of its ancestors

# 6. Push to github
We manage most of our development work on gitlab, but the public version of this codebase lives in [this github repo](https://github.com/uw-ictd/ccis-dashboard). Push to github by checking out that repo, copying all the files from your gitlab folder, looking over the diff to make sure you didn't add any extraneous files, and then pushing a new commit named with the new version number. You can add the release notes if you wrote any.
