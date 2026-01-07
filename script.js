// BookAnything™ — static demo app using localStorage
// Pages:
// - index.html: main app root (home, signup, login, listings, create listing, dashboard)
// - listing.html: show single listing and booking
(() => {
  const LS_USERS = "bookany_users";
  const LS_CURRENT = "bookany_current";
  const LS_LISTINGS = "bookany_listings";
  const LS_BOOKINGS = "bookany_bookings";

  // Utilities
  function $(sel, root=document) { return root.querySelector(sel); }
  function el(tag, props={}, ...children){
    const e = document.createElement(tag);
    Object.entries(props).forEach(([k,v]) => {
      if (k === "class") e.className = v;
      else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    children.flat().forEach(c => {
      e.append(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }

  // Data helpers
  function read(key){ return JSON.parse(localStorage.getItem(key) || "null"); }
  function write(key, v){ localStorage.setItem(key, JSON.stringify(v)); }
  function ensure(key, def){ const v = read(key); if (!v) { write(key, def); return def; } return v; }

  // Init default arrays
  ensure(LS_USERS, []);
  ensure(LS_LISTINGS, []);
  ensure(LS_BOOKINGS, []);

  function currentUser(){
    return localStorage.getItem(LS_CURRENT) || null;
  }
  function setCurrent(email){ if (email) localStorage.setItem(LS_CURRENT, email); else localStorage.removeItem(LS_CURRENT); }

  // Simple router for index.html app root
  function mountApp(){
    const root = document.getElementById("app");
    if (!root) return;
    function navBar(){
      const user = currentUser();
      const nav = el("div", {class:"header"},
        el("div", {}, el("h1", {}, "BookAnything™ — Demo")),
        el("div", {class:"topnav"},
          el("a", {href:"index.html"}, "Home"),
          el("a", {href:"listing.html"}, "Sample Listing"),
          user ? el("span", {}, `Signed in: ${user}`) : null,
          user ? el("a", {href:"#", onclick:()=>{ setCurrent(null); renderHome(); }}, "Sign out") :
                 el("a", {href:"#", onclick:()=> renderView("login")}, "Login"),
          user ? el("a", {href:"#", onclick:()=> renderView("create")}, "Create listing") :
                 el("a", {href:"#", onclick:()=> renderView("signup")}, "Sign up"),
          el("a", {href:"#", onclick:()=> renderView("dashboard")}, "Dashboard")
        )
      );
      return nav;
    }

    function renderHome(){
      root.innerHTML = "";
      root.append(navBar());
      root.append(el("div", {class:"card"}, el("h2", {}, "Discover Listings")));
      const listings = read(LS_LISTINGS) || [];
      if (listings.length === 0) {
        root.append(el("div", {class:"card"}, el("div", {}, "No listings yet. Create one!")));
        return;
      }
      listings.forEach(l => {
        const card = el("div", {class:"card listing-item"},
          l.imageData ? el("img", {class:"listing-image", src:l.imageData}) : null,
          el("div", {},
            el("h3", {}, el("a", {href:`listing.html?id=${l.id}`, class:"link"}, l.title)),
            el("div", {class:"small"}, l.description),
            el("div", {class:"small"}, `Price: $${(l.price || 0).toFixed(2)}`)
          )
        );
        root.append(card);
      });
    }

    function renderView(view){
      root.innerHTML = "";
      root.append(navBar());
      if (view === "signup") {
        const form = el("form", {onsubmit: async (e)=>{ e.preventDefault(); signup(); }});
        form.append(
          el("div", {class:"card"},
            el("h2", {}, "Sign up"),
            el("div", {class:"form-row"}, el("input", {type:"email", id:"su_email", placeholder:"Email", required:true})),
            el("div", {class:"form-row"}, el("input", {type:"text", id:"su_name", placeholder:"Your name (optional)"})),
            el("div", {class:"form-row"}, el("input", {type:"password", id:"su_pass", placeholder:"Password", required:true})),
            el("div", {}, el("button", {class:"btn", type:"submit"}, "Create account")),
            el("div", {id:"su_msg", class:"small"})
          )
        );
        root.append(form);
      }
      else if (view === "login") {
        const form = el("form", {onsubmit: async (e)=>{ e.preventDefault(); login(); }});
        form.append(
          el("div", {class:"card"},
            el("h2", {}, "Login"),
            el("div", {class:"form-row"}, el("input", {type:"email", id:"li_email", placeholder:"Email", required:true})),
            el("div", {class:"form-row"}, el("input", {type:"password", id:"li_pass", placeholder:"Password", required:true})),
            el("div", {}, el("button", {class:"btn", type:"submit"}, "Sign in")),
            el("div", {id:"li_msg", class:"small"})
          )
        );
        root.append(form);
      }
      else if (view === "create") {
        const form = el("form", {onsubmit: async (e)=>{ e.preventDefault(); createListing(); }});
        form.append(
          el("div", {class:"card"},
            el("h2", {}, "Create listing"),
            el("div", {class:"form-row"}, el("input", {type:"text", id:"li_title", placeholder:"Title", required:true})),
            el("div", {class:"form-row"}, el("textarea", {id:"li_desc", placeholder:"Description", rows:4, required:true})),
            el("div", {class:"form-row"}, el("input", {type:"number", id:"li_price", placeholder:"Price (USD)", step:"0.01", value:"10.00", required:true})),
            el("div", {class:"form-row"}, el("input", {type:"file", id:"li_image", accept:"image/*"})),
            el("div", {}, el("button", {class:"btn", type:"submit"}, "Create listing")),
            el("div", {id:"li_msg", class:"small"})
          )
        );
        root.append(form);
      }
      else if (view === "dashboard") {
        const userEmail = currentUser();
        if (!userEmail) {
          root.append(el("div", {class:"card"}, el("div", {}, "Please log in first.")));
          return;
        }
        root.append(el("div", {class:"card"}, el("h2", {}, "Seller Dashboard")));
        const listings = (read(LS_LISTINGS) || []).filter(l => l.owner === userEmail);
        const bookings = (read(LS_BOOKINGS) || []).filter(b => {
          const listing = (read(LS_LISTINGS)||[]).find(x => x.id === b.listingId);
          return listing && listing.owner === userEmail;
        });

        root.append(el("div", {class:"card"},
          el("h3", {}, "Your listings"),
          listings.length === 0 ? el("div", {class:"small"}, "No listings") :
            listings.map(l => el("div", {}, el("strong", {}, l.title), el("div", {class:"small"}, `$${(l.price||0).toFixed(2)}`)))
        ));

        root.append(el("div", {class:"card"},
          el("h3", {}, "Bookings for your listings"),
          bookings.length === 0 ? el("div", {class:"small"}, "No bookings") :
            bookings.map(b => {
              const lin = (read(LS_LISTINGS)||[]).find(x=>x.id===b.listingId) || {};
              return el("div", {}, el("strong", {}, lin.title || "Listing"), el("div", {class:"small"}, `From: ${b.startAt} — To: ${b.endAt}`), el("div", {class:"small"}, `Status: ${b.status}`));
            })
        ));
      }
    }

    // Auth functions
    function signup(){
      const email = $("#su_email").value.trim();
      const name = $("#su_name").value.trim();
      const pass = $("#su_pass").value;
      const users = read(LS_USERS) || [];
      if (!email || !pass) { $("#su_msg").textContent = "Missing fields"; return; }
      if (users.find(u=>u.email===email)) { $("#su_msg").textContent = "Email already used"; return; }
      users.push({email,name,password:pass});
      write(LS_USERS, users);
      setCurrent(email);
      renderHome();
    }

    function login(){
      const email = $("#li_email").value.trim();
      const pass = $("#li_pass").value;
      const users = read(LS_USERS) || [];
      const u = users.find(x=>x.email===email && x.password===pass);
      if (!u) { $("#li_msg").textContent = "Invalid credentials"; return; }
      setCurrent(email);
      renderHome();
    }

    // Create listing
    async function createListing(){
      const title = $("#li_title").value.trim();
      const desc = $("#li_desc").value.trim();
      const price = parseFloat($("#li_price").value) || 0;
      const file = $("#li_image").files[0];
      const owner = currentUser();
      if (!owner) { $("#li_msg").textContent = "Please login"; return; }
      let imageData = null;
      if (file) {
        imageData = await readFileAsDataURL(file);
      }
      const listings = read(LS_LISTINGS) || [];
      const id = (listings.reduce((m,x)=>(x.id>m?x.id:m),0) || 0) + 1;
      const l = { id, title, description:desc, price, imageData, owner };
      listings.push(l);
      write(LS_LISTINGS, listings);
      renderHome();
    }

    function readFileAsDataURL(file){
      return new Promise((res,rej)=>{
        const r = new FileReader();
        r.onload = ()=>res(r.result);
        r.onerror = ()=>rej();
        r.readAsDataURL(file);
      });
    }

    // Initial view
    renderHome();

    // Public helpers for listing page to use:
    window.bookany = {
      getListingById: function(id){ return (read(LS_LISTINGS)||[]).find(x => x.id === Number(id)); },
      currentUser: currentUser,
      createBooking: function(listingId, startAt, endAt){
        const user = currentUser();
        if (!user) return { error: "Please login" };
        const bookings = read(LS_BOOKINGS) || [];
        const id = (bookings.reduce((m,x)=>(x.id>m?x.id:m),0) || 0) + 1;
        const listing = (read(LS_LISTINGS)||[]).find(x=>x.id===Number(listingId));
        if (!listing) return { error: "Listing not found" };
        const b = { id, listingId:Number(listingId), booker:user, startAt, endAt, status:"pending", amount:listing.price };
        bookings.push(b);
        write(LS_BOOKINGS, bookings);
        return { ok:true, booking: b };
      },
      simulatePayForLatest: function(listingId){
        const user = currentUser();
        if (!user) return { error: "Please login" };
        const bookings = read(LS_BOOKINGS) || [];
        const bk = bookings.filter(b => b.listingId === Number(listingId) && b.booker === user).sort((a,b)=>b.id-a.id)[0];
        if (!bk) return { error: "No booking found" };
        bk.status = "paid";
        write(LS_BOOKINGS, bookings);
        return { ok:true, booking: bk };
      },
      getBookingsForUser: function(){ return (read(LS_BOOKINGS)||[]).filter(b=>b.booker===currentUser()); },
      getBookingsForOwner: function(ownerEmail){ return (read(LS_BOOKINGS)||[]).filter(b=>{
        const listing = (read(LS_LISTINGS)||[]).find(x=>x.id===b.listingId); return listing && listing.owner===ownerEmail;
      }) }
    };
  }

  // listing.html specific mount
  function mountListingPage(){
    const root = document.getElementById("listing-app");
    if (!root) return;
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const listing = window.bookany && id ? window.bookany.getListingById(id) : null;

    function nav(){
      return el("div", {class:"header"},
        el("div", {}, el("h1", {}, "BookAnything™ — Demo")),
        el("div", {},
          el("a", {href:"index.html"}, "Home"),
          el("a", {href:"index.html", onclick:(e)=>{}}, "Back")
        )
      );
    }

    if (!listing) {
      root.innerHTML = "";
      root.append(nav());
      root.append(el("div", {class:"card"}, el("div", {}, "Listing not found. Try opening the home page.")));
      return;
    }

    root.innerHTML = "";
    root.append(nav());
    root.append(el("div", {class:"card"},
      listing.imageData ? el("img", {class:"listing-image", src:listing.imageData}) : null,
      el("h2", {}, listing.title),
      el("div", {class:"small"}, listing.description),
      el("div", {class:"small"}, `Price: $${(listing.price||0).toFixed(2)}`)
    ));

    // Booking form
    const form = el("form", {onsubmit: (e)=>{ e.preventDefault(); doBook(); }});
    form.append(
      el("div", {class:"card"},
        el("h3", {}, "Book (simulated)"),
        el("div", {class:"form-row"}, el("label", {}, "Start:"), el("input", {type:"datetime-local", id:"bk_start", required:true})),
        el("div", {class:"form-row"}, el("label", {}, "End:"), el("input", {type:"datetime-local", id:"bk_end", required:true})),
        el("div", {}, el("button", {class:"btn", type:"submit"}, "Create booking (simulate pay later)")),
        el("div", {style:"margin-top:10px"}, el("button", {class:"btn", type:"button", onclick: ()=> { simulatePay(); }}, "Simulate Pay Now")),
        el("div", {id:"bk_msg", class:"small"})
      )
    );
    root.append(form);

    function doBook(){
      const start = $("#bk_start").value;
      const end = $("#bk_end").value;
      const r = window.bookany.createBooking(listing.id, start, end);
      const msg = $("#bk_msg");
      if (r.error) msg.textContent = r.error;
      else { msg.textContent = "Booking created. Visit Dashboard to see it."; window.location.href = "index.html"; }
    }
    function simulatePay(){
      const r = window.bookany.simulatePayForLatest(listing.id);
      const msg = $("#bk_msg");
      if (r.error) msg.textContent = r.error;
      else msg.textContent = "Payment simulated — booking marked as paid.";
    }
  }

  // On load:
  if (location.pathname.endsWith("index.html") || location.pathname.endsWith("/") || location.pathname === "") {
    mountApp();
  } else if (location.pathname.endsWith("listing.html")) {
    // small helper to ensure bookany is created (in case index didn't run)
    if (!window.bookany) {
      // Recreate minimal API by executing mountApp in a hidden root
      // But easiest is to call ensure data arrays (script guarantees localStorage keys exist)
      (function ensure(){
        if (!localStorage.getItem("bookany_users")) localStorage.setItem("bookany_users", JSON.stringify([]));
        if (!localStorage.getItem("bookany_listings")) localStorage.setItem("bookany_listings", JSON.stringify([]));
        if (!localStorage.getItem("bookany_bookings")) localStorage.setItem("bookany_bookings", JSON.stringify([]));
      })();
    }
    // Create a minimal global bookany if not present by reusing the index mount function
    // For simplicity, run a tiny inline implementation here:
    (function initMiniBookany(){
      if (window.bookany) { mountListingPage(); return; }
      // minimal getters used by listing page
      window.bookany = {
        getListingById: function(id){ return JSON.parse(localStorage.getItem("bookany_listings")||"[]").find(x=>x.id===Number(id)); },
        currentUser: function(){ return localStorage.getItem("bookany_current") || null; },
        createBooking: function(listingId, startAt, endAt){
          const user = localStorage.getItem("bookany_current");
          if (!user) return { error: "Please login" };
          const bookings = JSON.parse(localStorage.getItem("bookany_bookings")||"[]");
          const id = (bookings.reduce((m,x)=>(x.id>m?x.id:m),0) || 0) + 1;
          const listing = JSON.parse(localStorage.getItem("bookany_listings")||"[]").find(x=>x.id===Number(listingId));
          if (!listing) return { error: "Listing not found" };
          const b = { id, listingId:Number(listingId), booker:user, startAt, endAt, status:"pending", amount:listing.price };
          bookings.push(b);
          localStorage.setItem("bookany_bookings", JSON.stringify(bookings));
          return { ok:true, booking: b };
        },
        simulatePayForLatest: function(listingId){
          const user = localStorage.getItem("bookany_current");
          if (!user) return { error: "Please login" };
          const bookings = JSON.parse(localStorage.getItem("bookany_bookings")||"[]");
          const bk = bookings.filter(b => b.listingId === Number(listingId) && b.booker === user).sort((a,b)=>b.id-a.id)[0];
          if (!bk) return { error: "No booking found" };
          bk.status = "paid";
          localStorage.setItem("bookany_bookings", JSON.stringify(bookings));
          return { ok:true, booking: bk };
        }
      };
      mountListingPage();
    })();
  } else {
    // default: try mounting app (works on many hosting paths)
    mountApp();
  }
})();
