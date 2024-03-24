# Full-stack homework - Aviv Feldman

## Disclaimer
URL to the **TypeScript** version - **https://github.com/Avivfg/Aiven-Cloud-Selection-TS**

After completing the implementation and testing of both the frontend and the backend, I realized that the frontend was supposed to be in TS and not in JS.

Hence, the URL above will redirect you to the TS version I just implemented.

Sorry for the mistake, which doubled my work, but hey, now I also demonstrated my JS skills (and provided you an easy-to-read version of the app).

_The only thing left behind, for now, is the frontend testing, but I will provide that soon as well._

_(The commits here (https://github.com/Avivfg/Aiven-Cloud-Selection/commits/main/) show that I made all this in 3 days)_

-----
## About the code
### Backend
The backend is in charge of:
- Fetching the clouds data from Aiven's API.
- Storing the clouds and providers in the respective classes.
- Provide a GET function with FastAPI to the frontend requests.
- Fetching the initial data, sorted by distance data , and/or filtered by the desired providers.
- Taking as much processing work as he can from the backend, and connect it to the data on Aiven's system.

  The backend also holds testings, error management and best-practice loggings.


### Frontend
The frontend provides the user a display of the fetched data.
The user can then:
- Select clouds by clicing them, and deselect by clicking them again.
- Use the _clean up selection_ button.
- Use the _searchbar_ to choose the providers he wants to filter the results with.
The searchbar allows an easy selection, deselection and abort options. It supports a dropdown as well as a typing mechanism.
- Use the _sort by distance_ knob (if allowed the app to use his location).
- Use all the features together and expect to results to be persistant. i.e., sorting won't remove the selection, filtering will remove the selection indeed, but deselection will return the selections which were removed upon filtering in the first place.

The fronend also contains a sticky navbar, a count of the selected clouds, and a _Continue_ button at the top and button ("onClick" not implemented, as it is not included in the assignment).
All the features are disables/show/dismiss with the app logic, and all the functions hold error management.
