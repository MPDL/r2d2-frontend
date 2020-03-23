# heidi ready-to-serve versions

The *.zips in this folder is ready-for-serve deployed versions.<br />

Just unzip and copy into any webserver directory, it should run out of the box in dev-mode (using the mock-jsons in /config/mock-requests and the initial structure/translations jsons)

To connect Heidi with a real api, just set devmode = false in ths config/setup.js file and set the api paths for structure and translations there.<br />
After doing this, configure the initial forms and api targets in the structure / requests<br />
You can also mix static/json files and real api to support your development flow :-)
<br />
api targets starting with '/' will point to the home server, to consume a remote api you need to set the complete path.

<h2>Example:</h2>
Let's say your home server root is https://localhost:8080
If you config a request:

<pre><code>
    "requests": {
        "my-amazing-request: {
            ...
            "api": {
                "target": "/get-something"
            },
</code></pre>

This later will call: https://localhost:8080/get-something

<br />

If you want to connect to remote, config the request like this :

<pre><code>
    "requests": {
        "my-amazing-request: {
            ...
            "api": {
                "target": "https://coolApiServerForYou/get/cooldata"
            },
</code></pre>

This later will call exactly: https://coolApiServerForYou/get/cooldata

  