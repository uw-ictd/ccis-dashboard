Code review checklist
* [ ] 1. Check for merge conflicts. If there are any, this can only be a preliminary code review.
* [ ] 2. Read the diff. Understand every line and how the changes as a whole fit in to the codebase.
* [ ] 3. Make comments for any ways you see to improve the code. See CONTRIBUTING.md for more details.
* [ ] 4. Merge the code into `main` on your local machine, run the merged code, and confirm manually that the new changes behave as expected.
* [ ] 5. Run the tests against the merged code. We should never have failing tests on `main`
* [ ] 6. Leave a comment on the merge request if all of the above are okay, then merge it

# 1. Merge conflicts
If the merge conflicts are simple to fix, you can fix them yourself by merging `main` into the feature branch yourself.

# 2 and 3. Code quality
The purpose of code review is to improve the quality of the codebase so that future developers can contribute effectively. This means doing things the "right way" when there is one and taking the time to produce readable code. We should only merge good code, but it doesn't have to be perfect. Balance the effort of improvements with their impact. As a rule of thumb, asking the contributor to rewrite all of the code they are adding is okay if it's for a good reason, but if the best solution is to rewrite other parts of the codebase, save that for future work (and maybe make an issue for it).

See CONTRIBUTING.md for a "good code checklist"

# 4. Manual testing
It's okay to just test the things that were changed. A more thorough test of the application behavior can be saved for when we do a release.

# 5. Testing
Some of the slower tests (e.g. `map.test.js` and `visualizationsE2E.test.js`) are prone to timeout if they don't get enough CPU resources. Rerun these individually if they fail. If a test ever passes, that counts as passing. New code changes which make this problem worse should be rejected

# 6. Merging
If you have merged the code locally into your `main` branch, it is easiest to complete this by just pushing from your updated `main` branch. You can also click the merge button on gitlab, and then do a `git pull --rebase` to clean up your local work.

In either case, you should delete the feature branch from gitlab after the merge.
