# PRD
Repository to store ECMAScript code used in workflows created with the product NetIQ Identity Manager.

* <a href="PRD.js">PRD.js</a>: Development version of the library, with full comments and variable names.
    * Function documentation can be found at <a href="PRD.md">PRD.md</a>
* <a href="extensions/retrieveData.js">retrieveData.js</a>: Extension to PRD that facilitates reading multiple attributes from an entity
    * Extension documentation can be found at <a href="extensions/retrieveData.md">retrieveData.md</a>
* <a href="extensions/ctask.js">ctask.js</a>: Extension to PRD for basic form in-memory state keeping. Still in Alpha, use at your own discretion.</a>

More information about the product this can be used with can be found at <a href="https://www.netiq.com">https://www.netiq.com</a>

## RBPM Work flow development notes/suggestions

1. Save every value into flow data first.

    If you compute a value - for a conditional activity, or for an addressee, or for anything - save it put it in flow data via a mapping activity before you use it.

    Reasoning: by having the values in flowdata first it is possible to follow the flow and behavior of a workflow without the need to re-calculate values after the fact. This is useful both when troubleshooting a work flow in production and when debugging a workflow you are developing.

    This is especially useful for GCVs - by saving it in flowdata first we can perform validation if the GCV.get() was successful and also know what value the work flow saw at the moment it was executed, allowing you to validate after the fact if the GCV value was incorrect or broken.


2. Try not to overwrite (change) flow data values

    Rather, prefer to create new flow data nodes with any new values you need.

    For example, rather than putting a user’s GivenName + SN into a flow data node, and then later putting the user’s FullName into that same node: put it in a new node. This way we can see how the whole workflow unfolded at any point in the future, without having to re-create the state at a previous workflow activity.

    This is especially important regarding the workflow's initial values fed into flowdata from the Start activity's request form. By having those values it is possible to review and even re-issue a workflow at some point in the future.

    Obviously this cannot always be avoided - Loops, incrementing counters and so forth - so use good judgement.


3. If you need to delimit several values, use a serializer library (e.g. JSON)

    If you need to pass structured values around, avoid concatenating them with a string character. Instead use a library that will escape and parse them 100% correctly. This will avoid having to either strip or encode your delimiter when seen in the input data, as well as unexpected behaviors if you leave the input data un-encoded.


4. Map Activity suggestions:

    To make your workflow more readable try to make your "Source Expression" short or even a single function call. For this to be possible build your functions into Overview > Global Scripts with meaningful names and detailed comments on function usage, parameters and expected return values. I tend to follow the jsdoc standard on function comments to be able to auto-generate documentation from source code+comments using automated tools.

    To complement the above we should try to reuse functions as much as we can. One or few small, well-named, generic functions should meet most use cases. Function reuse across activities and workflows can save time and effort in the long run, as well as make the code easier to maintain and change.

    Try to group flowdata destinations under logical, hierarchical groupings. So instead of multiple flowdata.RESTWhatThisis entries do flowdata.REST/WhatThisis. Hierarchy helps both when coding and later when debugging the workflow, or even when exporting flowdata XML from the database for review.

    If you need a value more than once (especially as an intermediate value), refactor that code into a mapping activity prior to where you needed it. For example: If you have a mapping activity with 10 flow-data rows in it, and the ECMA script for all 10 of them begins with calculating some user-related information via substring matching and regex: take that repetitive logic out and put it in an earlier activity (DRY – Don’t Repeat Yourself principle).


5. Delay activities (also known as approval activites, when used to pause/wait a workflow)

    Use the timeout path as the default path.

    Addressee should be a custom account in eDirectory, preferably read from a GCV. Do not hard code a user if at all possible. Do not assign to the initiator, recipient or their managers to avoid cluttering their Work Dashboard. Provide a default fallback in case GCV.get() fails.

    The timeout value should be a parameter set in a flowdata section before the delay.

    Approval form should be simple and only be relevant if we allow early advancement via approval/denial. In that case these paths should pass by a log message to record that an early advancement (or cancellation) happened, and log by whom it happened. If no interation is allowed just create a form with a single field describing it is a wait/delay/pause activity and add an onload event to hide the buttons of said form.


6. Activity ID recommendations

    Change the activity ID of activities that will be referenced in later code from their default Activity# value, to make your code more readable.

    Personal preference is to start the ID with a 3 or 4 letter abbreviation such as map, log, appr, cond, inte, rest, stat, and so on; followed by camel case short name to describe what it does. This way when referring back to them we can have expressions like apprFromManager.getAddressee() instead of Activity657.getAddressee().

    There is no need to change all activity IDs to meaningful names, just ones that will be referenced in later code.

    An added bonus of this approach is that when looking at the web server's log the Activity: portion of the trace will have something that should help you understand where in the flow that particular process is at, instead of a number that have no meaning by itself. Of course to realize this benefit at least approval and flow control activities (branch, merge, condition) would need to have to be renamed.


## Notes

1. Retrieving a work flow's flowdata in IDM 4.5/4.6 is fairly simple. The information resides on the RBPM database, afdocument table, metaxml column. Each supported database will have its own command line tools we can use to automate the process.

    Assuming a standard Postgresql install as the RBPM database we can run the command:

    ```
    /opt/netiq/idm/apps/postgres/bin/psql -U postgres -d idmuserappdb -c "COPY (SELECT metaxml FROM afdocument WHERE requestid='largehexvalue') TO STDOUT" | sed -e 's/\\n//g' | xmllint --format - > /somefilepath/flowdata.xml
    ```

    where largehexvalue should be the workflow's request ID as seen in multiple places such as the web server's log, and look similar to this string: 4052f820a9db47cbace1a7fd82c88e90 somefilepath should be the path where you want to save your workflow's flowdata XML export. The sed and xmllint portions of the command simply pretty-format the returned XML with line breaks and indentation.

2. ECMA execution order when a form loads on the browser

    Engine scripts run first, their output goes to catalina.out:
    * engine: Overview > Global Scripts
      * Globalscripts load top to bottom
    * engine: Start > Pre Activity > [fieldname]
      * Field scripts are NOT executed top to bottom. Not sure on the order, currently suspect it may be alphabetical by field name

    Form (in browser) scripts run next, their output go to the form's HTML or the browser's console.log:
    * form: Overview > Global Scripts
      * Globalscripts load top to bottom
    * form: Form > Scripts > [script]
      * Scripts execute top to bottom
    * form: Form > Events > onload
    * form: Form > Fields > [field] > HTML Content
      * Fields are processed top to bottom
      * Only String-HTML fields have the "HTML Content" property
    * form: Form > Fields > [field] > onload
    * form: Form > Fields > [field] > onchange


    Comments:

    * Field events seem to trigger top to bottom based on their order in Designer;
    * Field onload happens on any given field before onchange. Onchange does trigger once during form load, so plan for it;
    * HTML Content ECMA script runs before the field events;
    * onchange did not trigger at all on the HTML field despite being set. Other field types might have the same constraint.
