# Mergify & Auto-merging of Module PRs
In the spirit of **Empowerment** as our first value, I would like to enable people to freely contribute modules to updraft that get automatically merged and rolled out to NPM when PRs meet two conditions:

1. `updraft check` ran successfully
2. The PR creator set the "🚀 MERGE ME!" label (to avoid premature merges that were unintended)

This explicitly **does not** include any sort of *quality control* or *required approvals from reviewers*.

**Positive Effects**  
1. People can contribute (and improve) faster than with traditional approaches
2. Workload for approving & reviewing modules is kept low (project maintainers can rather focus on improving `updraft` itself)
3. It lives up to two of our core values: **No entry barrier**, **empowerment**

**FAQ**

* Won't that lead to anarchy? No, because we're restricting this automatic merge to `/typescript/modules` (exlucing `/typescript/modules/creator-modules/`), like that we as maintainers still have control over the general structure of the project
* Won't that lead to bad code? It might, but just like any other module that you can download on NPM your mileage may vary, code quality comes down to the maintainers of modules. People can always ask for PR feedback if they want
* Won't people be able to just delete all updraft modules? That's a danger we should safeguard against - We'll have to build strong attribution for authors and contributors into the automated merging process, to make sure credit is given where credit is due & to make sure no modules can be deleted

**When do we need to revisit this decision?**  

We might face a heightened sense of chaos over this. In that case we'll have to put tools & processes in place to maintain **Simplicity**.
