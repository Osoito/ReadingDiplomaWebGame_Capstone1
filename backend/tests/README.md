# Backend Testing

This tests folder contains all of the automatic tests created for this project.
For more instructions refer to "Backend Testing Instructions" in the main README.md file in root of this git repository.

Testing is currently completed in two databases and environments. One for integration tests and one for unit tests.
- The configuration file for unit test environment can be found in the root of the backend repository: ***vitest.unit.config.js***
- The configuration file for integration test environment can be found in the root of the backend repository: ***vitest.integration.config.js***
- The databases are created with an automatic script when the tests are run. This script can be found in the ***/backend/scripts*** folder.
- The test databases are automatically destroyed after succesful testing by a script. This script can be found in the ***/backend/scripts*** folder.

The tests are made with VITEST, which is a testing framework.

## CI pipeline

The project has a CI pipeline that runs the tests automatically when changes are pushed to the git repository, which touch the backend. The pipeline is made with github actions. This ensures that updates do not break intended behavior of different functionalities.
- The actions done by the pipeline can be found in file ***backend-ci-yml***, which can be found in the ***.github/workflows*** folder in the root of the repository.

If one of the functionalities' outputs is changed, the tests need to be updated to reflect this.

## Integration tests

Integration tests can be found in the file ***api_integration.test.js*** under the folder ***integration***

All of the integration tests in this project are currently all found in the same file. This is to prevent knex migration lock.

## Unit tests

Unit tests can be found in the folder ***Unit***

The tests are separated by category of the system part that is being tested.

All of the unit tests besides model unit tests use mocks to simulate behavior of lower functions. This is to isolate the testing to only that part of the code.
### Coverage

Both testing environments produce a coverage report which shows how much of the code was tested in percentages. This can be used to see what parts of the code are not tested.
Both of the reports are separate and do not count the code covered in the other's environment.