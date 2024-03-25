# Full-stack homework - Aviv Feldman

## Disclaimer
URL to the **TypeScript** version - **https://github.com/Avivfg/Aiven-Cloud-Selection-TS**

After completing the implementation and testing of both the frontend and the backend, I realized that the frontend was supposed to be in TS and not in JS.

Hence, the URL above will redirect you to the TS version I just implemented.

Sorry for the mistake, which doubled my work, but hey, now I also demonstrated my JS skills (and provided you with an easy-to-read version of the app).

_The only thing left behind, is the tests for App.tsx (other frontend components have tests along with them)_

-----
## About the code
### Backend
The backend is in charge of:
- Fetching the clouds data from Aiven's API.
- Storing the clouds and providers in the respective classes.
- Provide a GET function with FastAPI to the frontend requests.
- Fetching the initial data, sorted by distance data, and/or filtered by the desired providers.
- Taking as much processing work as he can from the backend, and connecting it to the data on Aiven's system.

  The backend also holds tests, error management, and best-practice loggings.


### Frontend
The frontend provides the user with a display of the fetched clouds data.
The user can then:
- Select clouds by clicking them, and deselect by clicking them again.
- Use the _clean up selection_ button.
- Use the _searchbar_ to choose the providers he wants to filter the results with.
The search bar allows easy selection, deselection, and abort options. It supports a dropdown as well as a typing mechanism.
- Use the _sort by distance_ knob (if allowed the app to use his location).
- Use all the features together and expect to results to be persistent. i.e., sorting won't remove the selection, filtering will remove the selection indeed, but deselection will return the selections that were removed upon filtering in the first place.

The frontend also contains a sticky navbar, a count of the selected clouds, and a _Continue_ button at the top and button ("onClick" not implemented, as it is not included in the assignment).
All the features are disabled/shown/dismissed with the app logic, all components have test files, and all the functions hold error management.
