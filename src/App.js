import { useState, useEffect } from "react"
import './App.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import "leaflet/dist/leaflet.css";
import L from 'leaflet'

function App() {

  // Font Awesome CDN (inject dynamically)
  const fontAwesomeLink = document.createElement("link");
  fontAwesomeLink.rel = "stylesheet";
  fontAwesomeLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css";
  document.head.appendChild(fontAwesomeLink);

  // AOS CDN (inject dynamically)
  const aosScript = document.createElement("script");
  aosScript.src = "https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js";
  document.head.appendChild(aosScript);

  // Leaflet default marker
  const customIcon = new L.Icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // Initialize AOS animations
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.AOS) {
        window.AOS.init({ duration: 1200, once: true, offset: 50 });
        clearInterval(interval);
      }
    }, 500);
  }, []);

  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [coords, setCoords] = useState(null);
  const [data, setData] = useState(null)

  const handleformsubmit = async (e) => {
    e.preventDefault() 
    setLoading(true)
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://hub.juheapi.com/aqi/v1/city?apikey=64886f3c85bc500df8e338714cddaa29&q=${search}`)}`)
      const fetcheddata = await response.json()
      const parseddata = JSON.parse(fetcheddata.contents)
      console.log(parseddata)
      if (parseddata) {
        const lat = parseddata.data.geo.lat
        const lon = parseddata.data.geo.lon
        setCoords({ lat, lon })
        if (!isNaN(lat) && !isNaN(lon)) {
          setCoords({ lat, lon });
        } else {
          const geoRes = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
              search
            )}&key=390d578e6587468f80fd9d07f37e8f13`
          );
          const geoData = await geoRes.json();
          const geo = geoData?.results?.[0]?.geometry;
          if (geo) setCoords({ lat: geo.lat, lon: geo.lng });
        }
        setError("")
        setData({
          city: parseddata.data.city,
          aqi: parseddata.data.aqi,
          co: parseddata.data.co,
          geo: {
            lat: parseddata.data.geo.lat,
            lon: parseddata.data.geo.lon
          },
          no2: parseddata.data.no2,
          o3: parseddata.data.o3,
          pm10: parseddata.data.pm10,
          pm25: parseddata.data.pm25,
          so2: parseddata.data.so2
        })
      }
    } catch (error) {
      console.log(error)
      setData("")
      setError("Please Fill Correct City Name")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div class="container-fluid mx-auto w-100 h-100 d-flex justify-content-center align-items-center flex-column">
         
      <h4 className="fw-bold mb-0">
        <i className="fas fa-wind me-2"></i>Air Quality Tracker 2025
      </h4>
      <div class="d-flex flex-column align-items-center justify-content-center gap-2 my-4">
        <form onSubmit={handleformsubmit} class="d-flex justify-content-center  gap-2 align-items-center" data-aos="fade-down"
        >
          <label class="fw-bold fs-6">
            Search City : <input required class="rounded-3 p-1 px-2 " type="text" value={search} onChange={(e) => setSearch(e.target.value)} name="city" placeholder="city" />
          </label>
          <button class="btn btn-primary " type="submit" >
            {loading ? <span class={`spinner-border spinner-border-sm`} role="status" aria-hidden="true"></span> : "Search"}
          </button>
        </form>
      </div>
      {
        loading ? <div>
          loading...
        </div> :
          error ? <p class="d-flex align-items-center justify-content-center p-1 fw-bold error-bgcolor border-danger border rounded-2 w-100 text-danger">{error}</p> :
            data ? <div data-aos="fade-up" class="border rounded-4 w-100 p-3 bg-light-green ">
              <h6 class="w-100 text-center fw-bold fs-3">{data.city}</h6>
              <div class="d-flex align-items-center  w-100">
                <div class=" w-50">
                  <p class="fw-bold fs-6">Aqi : {data.aqi}</p>
                  <p class="fw-bold fs-5">co : {data.co}</p>
                  <p class="fw-bold fs-5">no2 : {data.no2}</p>
                  <p class="fw-bold fs-5">o2 : {data.o3}</p>
                  <p class="fw-bold fs-5">pm10 : {data.pm10}</p>
                  <p class="fw-bold fs-5">pm25: {data.pm25}</p>
                  <p class="fw-bold fs-5">so2 : {data.so2}</p>
                  <label><strong>Geo</strong></label>
                  <p class="fw-bold fs-5">lat : {data.geo.lat}</p>
                  <p class="fw-bold fs-5">lon : {data.geo.lon}</p>
                </div>
                {coords ?
                  <div
                    className="mt-4 rounded overflow-hidden w-50"
                    data-aos="zoom-in"
                    style={{
                      borderRadius: "15px",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    <MapContainer
                      center={[coords.lat, coords.lon]}
                      zoom={11}
                      style={{ height: "400px", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>&#39'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[coords.lat, coords.lon]}
                        icon={customIcon}
                      >
                        <Popup>
                          <i className="fas fa-location-dot me-2"></i>
                          {data.city}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div> : ""}
              </div> 
            </div>

              :

              <div>
                <h3 className="alert alert-danger">Please Enter City Name to See Details...</h3>
                </div>}
    </div>
  )
}

export default App