



// dashboard/pages/dashboard/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import SidebarDashly from "../../layouts/navbars/NavbarVertical";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCheck, faBasketShopping, faGlobe, faSwatchbook} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import NavbarTop from '../../layouts/navbars/NavbarTop';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Filler, CategoryScale, LinearScale, PointElement, LineElement, Title} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the plugin
import { Doughnut, Line } from 'react-chartjs-2';



ChartJS.register(ArcElement, Tooltip, Legend, Filler, ChartDataLabels, CategoryScale, LinearScale, PointElement, LineElement, Title);


import { api, getUserId } from "../../lib/api";

const USER_ID_CONST = "demo-user";
const TEMPLATE_ID_CONST = "gym-template-1";

const NAVBAR_H = 48;            // top bar height
const BREAKPOINT = 1120;         // ≤ 993px => compact

const http = axios.create({ baseURL: "" });

/* ---------------- Inline Template Chooser Card ---------------- */
function TemplateChooserCard({ onOpenEditor }) {
  const router = useRouter();
  const userId = getUserId();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const list = await api.listTemplates();
        const sel = await api.selectedTemplateForUser(userId);
        if (off) return;
        setTemplates(list?.data || []);
        setSelected(sel?.data?.templateId || null);
      } catch (e) {
        if (!off) setError(e.message || "Failed to load templates");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, [userId]);

  async function choose(templateId) {
    try {
      setSaving(true);
      await api.selectTemplate(templateId, userId);
      setSelected(templateId);
    } catch (e) {
      alert(e.message || "Failed to select template");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* <Card className="border-0 ion-card h-100 template-card">
        <Card.Body className="px-4 pt-4 pb-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
              Your Website Themes
            </h5>
            <div className="card-icon">
              <img src="/icons/layout.png" alt="Template Chooser" />
            </div>
          </div>

          {loading && <div className="text-muted">Loading theme…</div>}
          {error && <div className="text-danger">{error}</div>}

          {!loading && !error && (
            <div className="d-grid" style={{
              // gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: 12
            }}>
              {templates.map(t => (
                <div key={t.templateId} className={`p-3 rounded-3 border ${selected === t.templateId ? "border-primary shadow-sm" : "border-light"}`} style={{ background:"#fff" }}>
                  <div style={{ height: 110, borderRadius: 10, background:"linear-gradient(135deg,#f5f7fa,#e4ecf7)" }} />
                  <div className="mt-2 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-semibold">{t.name}</div>
                      <div className="text-muted" style={{ fontSize:12 }}>ID: {t.templateId}</div>
                    </div>
                    <button
                      className="btn btn-sm"
                      style={{ background:"#111827", color:"#fff", borderRadius:8 }}
                      disabled={saving || selected === t.templateId}
                      onClick={() => choose(t.templateId)}
                      title={selected === t.templateId ? "Already selected" : "Select this template"}
                    >
                      {selected === t.templateId ? "Selected ✓" : (saving ? "Saving…" : "Select")}
                    </button>
                  </div>
                  <div className="mt-2 d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => router.push(`/templates/preview/${t.templateId}`)}
                      style={{ borderRadius:8 }}
                    >
                      Preview
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={onOpenEditor}
                      disabled={!selected || selected !== t.templateId}
                      style={{ borderRadius:8 }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
                <div className={`p-3 rounded-3 border `} style={{ background:"#ffffff" }}>
                  <div style={{ height: 110, borderRadius: 10, background:"linear-gradient(135deg,#f5f7fa,#e4ecf7)" }} />
                  <div className="mt-2 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-semibold">Template 3</div>
                      <div className="text-muted" style={{ fontSize:12 }}>ID: 12323</div>
                    </div>
                    <button
                      className="btn btn-sm"
                      style={{ background:"#111827", color:"#fff", borderRadius:8 }}
                    >
                      Select
                    </button>
                  </div>
                  <div className="mt-2 d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      style={{ borderRadius:8 }}
                    >
                      Preview
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      style={{ borderRadius:8 }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div className={`template-card `}>
                  <div className="template-snippet" style={{ backgroundImage:`url("/images/preview1.png")` }} />
                  <div className="template-info">
                    <div className="mt-2 d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-semibold">Template 3</div>
                        <div className="" style={{ fontSize:12 }}>ID: 12323</div>
                      </div>
                      <button
                        className="btn btn-sm"
                        style={{ background:"#ffffffff", color:"#fff", borderRadius:8 }}
                      >
                        Select
                      </button>
                    </div>
                    <div className="mt-2 d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        style={{ borderRadius:8 }}
                      >
                        Preview
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ borderRadius:8 }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
                
            </div>
          )}
        </Card.Body>
      </Card> */}

      <div className="anim-card-wrapper dark-bg cap-med template-card">
        <div className="anim-card">
          <div className="border-shadow-top"></div>
          <div className="border-shadow-right"></div>
          <div className="border-shadow-bottom"></div>
          <div className="border-shadow-left"></div>
          <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
              <filter id='noiseFilter'>
                <feTurbulence 
                  type='fractalNoise' 
                  baseFrequency='20.43' 
                  numOctaves='400' 
                  stitchTiles='stitch'/>
              </filter>
              
              <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
          </svg>
          <Card.Body className="p-3">
            <div>
              <div className="d-flex justify-content-end">
                <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">{`0` }</span>
              </div>
              <h6 className="card-title mb-1">
                Themes
              </h6>
              <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                Access customizable website designs
              </p>
            </div>

            <div className="template-card-wrapper">

              {loading && <div className="text-muted">Loading theme…</div>}
              {error && <div className="text-danger">{error}</div>}

              {!loading && !error && (

                templates.map(t => (

                  <div key={t.templateId} className={`template-card ${selected === t.templateId ? "active" : ""} `}>
                    <div className="template-snippet" style={{ backgroundImage:`url("/images/preview1.png")` }}>
                      <div className="template-info">
                        <div className="mt-2 d-flex align-items-center justify-content-between">
                          <div>
                            <div className="template-title">Template 3</div>
                            <div className="template-sub-title" style={{ fontSize:12 }}>ID: 12323</div>
                          </div>
                        </div>
                        <div className="mt-2 d-flex gap-2">
                          <button
                            className="w-100"
                            onClick={() => choose(t.templateId)}
                            disabled={saving || selected === t.templateId}
                          >
                            {selected === t.templateId ? "Currently selected" : (saving ? "Saving…" : "Apply theme")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                
                ))

              )}

            </div>

            <div className={`button-wrapper d-flex flex-column gap-2`}>
              <button
                type="button"
                className="primary-btn w-100"
                onClick=""
              >
                View All
              </button>
            </div>
          </Card.Body>
        </div>
        <figcaption>
          <span>
            {/* <FontAwesomeIcon icon={faGlobe} /> */}
            <FontAwesomeIcon icon={faSwatchbook} />
          </span>
        </figcaption>
      </div>

    </>
  );
}

const email_account = [
    {
      username: "marco",
      domain: "mavsketch.com",
      storage_used: 1536,
      label: "1.5GB",
      storage_allocation: 0,
      storage_unit: "MB",
    },
    {
      username: "nahla",
      domain: "mavsketch.com",
      storage_used: 204.8,
      label: "204.9MB",
      storage_allocation: 2,
      storage_unit: "MB",
    },
    {
      username: "miguel",
      domain: "mavsketch.com",
      storage_used: 523,
      label: "523MB",
      storage_allocation: 1,
      storage_unit: "MB",
    },
    {
      username: "info",
      domain: "mavsketch.com",
      storage_used: 2048,
      label: "2GB",
      storage_allocation: 0,
      storage_unit: "MB",
    },
    {
      username: "marco2",
      domain: "mavsketch.com",
      storage_used: 1536,
      label: "1.5GB",
      storage_allocation: 0,
      storage_unit: "MB",
    },
    {
      username: "nahla2",
      domain: "mavsketch.com",
      storage_used: 204.8,
      label: "204.9MB",
      storage_allocation: 2,
      storage_unit: "MB",
    },
    {
      username: "miguel2",
      domain: "mavsketch.com",
      storage_used: 523,
      label: "523MB",
      storage_allocation: 1,
      storage_unit: "MB",
    },
    {
      username: "info2",
      domain: "mavsketch.com",
      storage_used: 2048,
      label: "2GB",
      storage_allocation: 0,
      storage_unit: "MB",
    },
    {
      username: "thirdy",
      domain: "mavsketch.com",
      storage_used: 2048,
      label: "2GB",
      storage_allocation: 0,
      storage_unit: "MB",
    }
  ];

const storage = [
  {
    used: 2,
    storage_allocation: 10,
    storage_unit: "GB",
  }
]
/* ------------------------------ MAIN DASHBOARD ------------------------------ */
export default function DashboardHome() {
  const [homePageId, setHomePageId] = useState(null);
  const [fetchErr, setFetchErr] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false); // < 992px
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [emailLabel, setEmailLabel] = useState([]);
  const toggleMenu = () => setShowMenu(prev => !prev);
  // simple color palette (repeats if more accounts)
    // const palette = [
    //   'rgba(255, 99, 132, 1)',
    //   'rgba(54, 162, 235, 1)',
    //   'rgba(255, 206, 86, 1)',
    //   'rgba(75, 192, 192, 1)',
    //   'rgba(153, 102, 255, 1)',
    //   'rgba(255, 159, 64, 1)',
    //   'rgba(112, 255, 64, 1)',
    //   'rgba(9, 255, 169, 1)',
    //   'rgba(255, 64, 64, 1)',
    //   'rgba(255, 64, 207, 1)',
    // ];
    const palette = [
      'rgba(120, 113, 108, 1)',   // Warm gray
      'rgba(147, 197, 253, 1)',   // Soft blue
      'rgba(186, 230, 253, 1)',   // Light blue
      'rgba(209, 250, 229, 1)',   // Mint green
      'rgba(254, 215, 170, 1)',   // Peach
      'rgba(221, 214, 254, 1)',   // Lavender
      'rgba(253, 230, 138, 1)',   // Pale yellow
      'rgba(204, 251, 241, 1)',   // Seafoam
      'rgba(229, 231, 235, 1)',   // Cool gray
      'rgba(254, 205, 211, 1)'    // Blush pink
    ];


  useEffect(() => {
      const handleResize = () => {
        const compact = window.innerWidth <= BREAKPOINT;
        setIsCompact(compact);
        if (!compact) setShowMenu(false);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    useEffect(() => {
      if (typeof document === 'undefined') return;
      document.body.classList.toggle('sidebar-open', isCompact && showMenu);
    }, [isCompact, showMenu]);

  useEffect(() => {
    const onResize = () => {
      const below = window.innerWidth <= 1120;
      setIsBelowLg(below);
      setSidebarOpen(!below);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFetchErr(null);
      try {
        const primary = await http.get("/api/sections", {
          params: {
            userId: USER_ID_CONST,
            templateId: TEMPLATE_ID_CONST,
            type: "page",
            slug: "home",
          },
          timeout: 15000,
        });

        const pRows = Array.isArray(primary.data)
          ? primary.data
          : primary.data?.data || [];

        let page =
          pRows.find(
            (r) =>
              r?.type === "page" &&
              (r?.slug?.toLowerCase() === "home" ||
                r?.title?.toLowerCase() === "home")
          ) || null;

        if (!page) {
          const fallback = await http.get(
            `/api/sections/${USER_ID_CONST}/${TEMPLATE_ID_CONST}`,
            { timeout: 15000 }
          );
          const fRows = Array.isArray(fallback.data)
            ? fallback.data
            : fallback.data?.data || [];
          page =
            fRows.find(
              (r) =>
                r?.type === "page" &&
                (r?.slug?.toLowerCase() === "home" ||
                  r?.title?.toLowerCase() === "home")
            ) || null;
        }

        if (!cancelled) setHomePageId(page?._id || null);
        if (!page) setFetchErr("Could not locate a 'home' page in API response.");
      } catch (err) {
        if (!cancelled) {
          setHomePageId(null);
          setFetchErr(err?.message || "Request failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // helper: show decimals only when needed (e.g. 10 -> "10", 10.5 -> "10.5")
  const formatSmart = (value, decimals = 1) => {
    if (value == null || Number.isNaN(Number(value))) return "";
    const n = Number(value);
    const rounded = Number(n.toFixed(decimals));
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
  };


  // -----------Declaring useState for chart data (EMAIL) -----------
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Storage used',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });
  useEffect(() => {
    // map email_account into chart-friendly structure (use storage_used as slice value)
    const labels = email_account.map((acc) => acc.username || 'unknown');
    const customLabel = email_account.map((acc) => acc.label || 'unknown');
    const values = email_account.map((acc) => {
      const v = parseFloat(acc.storage_used);
      return Number.isFinite(v) ? v : 0;
    });
    console.log('values:', values);
    // build background colors repeated to match labels
    // const bg = labels.map((_, i) => palette[i % palette.length]);
    const bg = labels.map((_, i) => palette[i % palette.length].replace('1)', '0.2)'));

    // create border colors by replacing the alpha (0.8) with 1, fallback to original color
    // const borderColor = palette;
    const borderColor = labels.map((_, i) => palette[i % palette.length]);
    

    setChartData({
      labels,
      datasets: [
        {
          label: 'Storage used',
          customLabel: customLabel,
          data: values,
          backgroundColor: bg,
          borderColor,
          borderWidth: 1.5,
          borderRadius: 4,
          offset: 20,
          hoverOffset: 35,
        },
      ],
    });
  }, [email_account]);
// -----------END -----------

  // total storage (sum of dataset values) in same unit as data (MB), convert to GB for display
  const totalStorageMB = (chartData?.datasets?.[0]?.data || []).reduce((s, n) => s + (Number(n) || 0), 0);
  const totalStorageGB = totalStorageMB / 1024;


// -----------Declaring useState for storage data (STORAGE) -----------
const ARC_DEG = 240; // change this to whatever circumference you want
  const [storageData, setStorageData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Storage used',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });


  const values = [storage[0].used, storage[0].storage_allocation - storage[0].used];

  useEffect(() => {

    setStorageData({
      labels: [
        'Used Storage',
        'Storage Available',
      ],
      datasets: [
        {
          label: 'Storage',
          // customLabel: customLabel,
          data: values,
          // backgroundColor:
          // [
          //   'rgba(213, 255, 64, 1)',
          //   'rgba(225, 225, 225, 1)'
          // ],
          backgroundColor: function(context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              // This can happen on first render, ignore
              return;
            }

            // Create a vertical linear gradient
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(213, 255, 64, 1)'); // Green at the bottom
            gradient.addColorStop(1, 'rgba(215, 68, 5, 1)'); // Red at the top

            return [gradient, 'rgba(225, 225, 225, 1)'];
          },
          borderColor: [
            'rgba(213, 255, 64, 0)',
            'rgba(225, 225, 225, 0)'],
          borderWidth: 1.5,
          borderRadius: 4,
          offset: 10,
          hoverOffset: 35,
        },
      ],
    });
  }, [email_account]);


  // storage remaining (for the half-doughnut card)
  const storageUsed = Number(storage?.[0]?.used || 0); // in GB
  const storageAlloc = Number(storage?.[0]?.storage_allocation || 1); // in GB
  const storageRemainingGB = Math.max(0, storageAlloc - storageUsed);
  const storageRemainingPercent = storageAlloc > 0 ? (storageRemainingGB / storageAlloc) * 100 : 0;
// -----------END -----------


// -----------------------Declaring useState for Your (Site visitor) LINE chart data
const lineData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Visitors',
      data: [0, 29, 80, 41, 10, 89],
      // fill: false,
      fill: 'origin', // <-- Set fill to 'origin' to fill to the bottom
      // backgroundColor: 'rgba(75, 192, 192, 0.2)', // <-- Color of the filled area
      backgroundColor: (context) => {
        const { chart } = context;
        const { ctx, chartArea } = chart;

        if (!chartArea) {
          // This case happens on initial render
          return;
        }

        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        const topColor = 'rgba(213, 255, 64, 0.3)'; // Current color with opacity
        const bottomColor = 'rgba(213, 255, 64, 0)'; // Same color, but transparent

        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);

        return gradient;
      },
      borderColor: '#d5ff40',
      borderWidth: 1.0,
      tension: 0.4, // <-- Optional: Adds curve to the line
    },
  ],
};

// Your chart options
const lineOptions = {
  responsive: true,
  layout: {
      padding: {
          // left: 10,
          right: 20, // Increase right padding for labels on the right
          top: 20,
          // bottom: 10
      }
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
      text: 'Chart.js Line Chart with Fill',
    },
    datalabels: {
      color: '#fff',
      anchor: 'top',
      align: 'top',
      formatter: (value, context) => {
        console.log(context);
        const idx = context?.dataIndex;
        const labels = context?.chart?.data?.labels || [];
        const label = labels[idx] ?? '';
        const CustomLabels = context?.chart?.data?.datasets[0]?.customLabel || [];
        const customLabel = CustomLabels[idx] || '';
        return customLabel ? `${customLabel}` : String(value);
      },
      anchor: 'top', // Position the label in the center of the slice
      align: 'top', // Align the text within the label
    },
  },
  scales: {
    x: {
      // Hide the vertical grid lines
      grid: {
        display: false,
      },
      border: {
        display: false, // Hides the vertical axis line
      },
      ticks: {
        color: '#ffffff77', // Change x-axis label color to white
      },
    },
    y: {
      beginAtZero: true, 
      // <-- Optional: Start the y-axis at 0
      grid: {
        display: true,
      },
      border: {
        display: false, // Hides the vertical axis line
      },
      ticks: {
        display: false,
        color: 'transparent', // Change x-axis label color to white
      }
      
    },
  },
};

// -----------END -----------

  return (
    <>
      {isCompact && (
        <button
          className="btn btn-outline-secondary position-fixed navbar-button"
          setSidebarOpen
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {/* <FontAwesomeIcon icon={faBars} /> */}
          <img src={`/icons/${sidebarOpen ? "menu-close.png" : "002-app.png"}`} alt="Pro Plan" />
        </button>
      )}
      <div className="header">
        <NavbarTop
          isMobile={isCompact}
          toggleMenu={toggleMenu}
          sidebarVisible={!isCompact}
        />
      </div>
      {/* <style jsx global>{`
        #page-content { background-color: transparent !important; }
      `}</style> */}

      <div className="bg-wrapper-custom">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
        <div className="blob blob4" />
        <div className="blob blob5" />
        <div className="bg-inner-custom" />
      </div>

      <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCompact={isCompact} setIsCompact={setIsCompact} isMobile={isBelowLg} />
        {/* <button
          type="button"
          onClick={() => setSidebarOpen((s) => !s)}
          className="btn btn-link d-lg-none position-fixed top-0 start-0 m-3 p-2 z-3"
          aria-label="Toggle menu"
          style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}
        >
          <FontAwesomeIcon icon={faBars} />
        </button> */}

        <main
          className="main-wrapper"
          style={{
            flexGrow: 1,
            marginLeft: !isBelowLg && sidebarOpen ? 240 : 0,
            transition: "margin-left 0.25s ease",
            padding: "3.5rem 10px 20px 10px",
            width: "100%",
            overflowX: "hidden",
          }}
        >
          <Container fluid="xxl" className="dash-container">
            <h5 className="container-title">
              Welcome back, Marco!
            </h5>
            <p className="container-subtitle">
              Here&apos;s your website overview and next steps to complete your setup.
            </p>

            <Row className="g-4">

              {/* First row */}
              <Col xs={12} md={12} lg={12} xl={9} className="">

                {/* ---------- your existing dashboard cards below ---------- */}
                <Row className="g-4 mt-2" style={{height: "100%"}}>
                  {/* --Current Subscription-- */}
                  <Col xs={12} md={7} lg={7} xl={7}>
                    <Card className="border-0 ion-card h-100 box-card">
                      <Card.Body className="position-relative px-4 pt-5 pb-4">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h5 className="card-title">
                              Current Subscription
                            </h5>
                            <div className="card-icon">
                              <img src="/icons/crown.svg" alt="Pro Plan" />
                            </div>
                          </div>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">Pro Plan</span>
                            <span className="px-3 py-1 rounded-pill fw-bold badge-soft-gray">Monthly</span>
                          </div>
                        </div>

                        <div className="card_wrapper_custom">
                          <h4 className="">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 344.84 299.91" width="18" height="18" aria-hidden="true" focusable="false">
                                <path fill="#ffffff" d="M342.14,140.96l2.7,2.54v-7.72c0-17-11.92-30.84-26.56-30.84h-23.41C278.49,36.7,222.69,0,139.68,0c-52.86,0-59.65,0-109.71,0,0,0,15.03,12.63,15.03,52.4v52.58h-27.68c-5.38,0-10.43-2.08-14.61-6.01l-2.7-2.54v7.72c0,17.01,11.92,30.84,26.56,30.84h18.44s0,29.99,0,29.99h-27.68c-5.38,0-10.43-2.07-14.61-6.01l-2.7-2.54v7.71c0,17,11.92,30.82,26.56,30.82h18.44s0,54.89,0,54.89c0,38.65-15.03,50.06-15.03,50.06h109.71c85.62,0,139.64-36.96,155.38-104.98h32.46c5.38,0,10.43,2.07,14.61,6l2.7,2.54v-7.71c0-17-11.92-30.83-26.56-30.83h-18.9c.32-4.88.49-9.87.49-15s-.18-10.11-.51-14.99h28.17c5.37,0,10.43,2.07,14.61,6.01ZM89.96,15.01h45.86c61.7,0,97.44,27.33,108.1,89.94l-153.96.02V15.01ZM136.21,284.93h-46.26v-89.98l153.87-.02c-9.97,56.66-42.07,88.38-107.61,90ZM247.34,149.96c0,5.13-.11,10.13-.34,14.99l-157.04.02v-29.99l157.05-.02c.22,4.84.33,9.83.33,15Z" />
                              </svg>29.99 <small className="">/month</small>
                          </h4>
                          <div className="col-info-wrapper">
                            <div className="col-info">
                              <span className="bold">Next billing date</span>
                              <span>Nov 01, 2025</span>
                            </div>
                            <div className="col-info">
                              <span className="bold">Days Remaining</span>
                              <span>6 Days</span>
                            </div>
                          </div>

                          <div className="progress thin">
                            <div className="progress-bar bg-mavsketch" style={{ width: `${(24 / 30) * 100}%` }}>
                              
                            </div>
                          </div>
                        </div>

                      </Card.Body>
                    </Card>
                    
                  </Col>

                  {/* --My Products-- */}
                  <Col xs={12} md={5} lg={5} xl={5}>
                    <div className="anim-card-wrapper primary-bg cap-med">
                      <div className="anim-card">
                        <div className="border-shadow-top"></div>
                        <div className="border-shadow-right"></div>
                        <div className="border-shadow-bottom"></div>
                        <div className="border-shadow-left"></div>
                        
                        <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
                            <filter id='noiseFilter'>
                              <feTurbulence 
                                type='fractalNoise' 
                                baseFrequency='20.43' 
                                numOctaves='400' 
                                stitchTiles='stitch'/>
                            </filter>
                            
                            <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
                        </svg>
                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <div className="d-flex justify-content-end">
                                <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">+2.1%</span>
                              </div>
                            </div>
                          
                            <h6 className="card-title mb-1">
                              My Products
                            </h6>
                            <p className="mb-0">
                              Summary of all your products.
                            </p>
                          </div>
                          <div className="products-summary">
                            <div className="product-item">
                              <span className="product-name">Total Products</span>
                              <span className="product-value">128</span>
                            </div>
                            <div className="product-item">
                              <span className="product-name">Active Products</span>
                              <span className="product-value">115</span>
                            </div>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>
                          <FontAwesomeIcon icon={faBasketShopping} />
                        </span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* --Visitors-- */}
                  <Col xs={12} md={5} lg={5} xl={5}>
                    <div className="anim-card-wrapper dark-bg cap-xl">
                      <div className="anim-card">
                        <div className="border-shadow-top"></div>
                        <div className="border-shadow-right"></div>
                        <div className="border-shadow-bottom"></div>
                        <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
                              <filter id='noiseFilter'>
                                <feTurbulence 
                                  type='fractalNoise' 
                                  baseFrequency='20.43' 
                                  numOctaves='400' 
                                  stitchTiles='stitch'/>
                              </filter>
                              
                              <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
                          </svg>
                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">{`${((8.2/50)*100).toFixed(2)}%` }</span>
                            </div>
                            <h6 className="card-title mb-1">
                              Site Visitors
                            </h6>
                            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                              See how many visits your website is getting.
                            </p>
                          </div>
                          <div className="card_anim_body">
                            <div className="lineChart-Container">
                              <Line data={lineData} options={lineOptions} />
                            </div>
                          </div>

                          
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>{`${((13/14)*100).toFixed(2)}%`}</span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* --Website Editor-- */}
                  <Col xs={12} md={7} lg={7} xl={7}>
                    <div className="anim-card-wrapper dark-bg cap-xl">
                      <div className="anim-card">
                        <div className="border-shadow-top"></div>
                        <div className="border-shadow-right"></div>
                        <div className="border-shadow-bottom"></div>
                        <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
                            <filter id='noiseFilter'>
                              <feTurbulence 
                                type='fractalNoise' 
                                baseFrequency='20.43' 
                                numOctaves='400' 
                                stitchTiles='stitch'/>
                            </filter>
                            
                            <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
                        </svg>
                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">{`${((8.2/50)*100).toFixed(2)}%` }</span>
                            </div>
                            <h6 className="card-title mb-1">
                              Edit My Website
                            </h6>
                            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                              Quick access to your website editor and customization tools.
                            </p>
                          </div>
                          <div className="card_anim_body">
                            {/* <p className="">
                              Quick access to your website editor and customization tools.
                            </p> */}

                            <div className="col-info">
                              <span className="bold">Last edited</span>
                              <span>2 hours ago</span>
                            </div>
                            <div className="col-info">
                              <span className="bold">Draft changes</span>
                              <span>3 pending</span>
                            </div>
                            <div className="col-info">
                              <span className="bold">Template</span>
                              <span>Modern Blog</span>
                            </div>
                          </div>

                          <div className={`button-wrapper d-flex flex-column gap-2 ${isCompact ? 'dir-inline' : ''}`}>
                            {homePageId ? (
                              <button
                                type="button"
                                className="primary-btn"
                                onClick={() => router.push(`/editorpages/page/${homePageId}`)}
                                
                              >
                                Open Editor
                              </button>
                            ) : (
                              <button type="button" className="btn button-dark" disabled style={{ color: "#fff" }}>
                                <div className="modern-loader">
                                  <svg viewBox="0 0 120 120" className="infinity-loader">
                                    <path
                                      className="infinity-path"
                                      d="M60,15 a45,45 0 0 1 45,45 a45,45 0 0 1 -45,45 a45,45 0 0 1 -45,-45 a45,45 0 0 1 45,-45"
                                    />
                                  </svg>
                                </div>
                                Initializing…
                              </button>
                            )}
                            <button
                              type="button"
                              className=""
                            >
                              Preview Changes
                            </button>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>{`${((13/14)*100).toFixed(2)}%`}</span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* --Domain-- */}
                  <Col xs={12} md={4} lg={4} xl={4}>
                    <div className="anim-card-wrapper dark-bg cap-med">
                      <div className="anim-card">
                        <div className="border-shadow-top"></div>
                        <div className="border-shadow-right"></div>
                        <div className="border-shadow-bottom"></div>
                        <div className="border-shadow-left"></div>
                        <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
                            <filter id='noiseFilter'>
                              <feTurbulence 
                                type='fractalNoise' 
                                baseFrequency='20.43' 
                                numOctaves='400' 
                                stitchTiles='stitch'/>
                            </filter>
                            
                            <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
                        </svg>
                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">{`0` }</span>
                            </div>
                            <h6 className="card-title mb-1">
                              My Domain
                            </h6>
                            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                              Quick info about your domain settings.
                            </p>
                          </div>
                          <div className="card_anim_body">
                            <div className="domain-wrapper">
                              <span className="https">https://</span>
                              <span>marcobotton.com</span>
                            </div>
                          </div>

                          <div className={`button-wrapper d-flex flex-column gap-2`}>
                            <button
                              type="button"
                              className="primary-btn w-100"
                              onClick={() => router.push(`/editorpages/page/${homePageId}`)}
                            >
                              Visit your site
                            </button>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span><FontAwesomeIcon icon={faGlobe} /></span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* --Storage-- */}
                  <Col xs={12} md={4} lg={4} xl={4}>
                    <div className="anim-card-wrapper dark-bg cap-xl">
                      <div className="anim-card">
                        <div className="border-shadow-top"></div>
                        <div className="border-shadow-right"></div>
                        <div className="border-shadow-bottom"></div>
                        <div className="border-shadow-left"></div>
                        <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
                            <filter id='noiseFilter'>
                              <feTurbulence 
                                type='fractalNoise' 
                                baseFrequency='20.43' 
                                numOctaves='400' 
                                stitchTiles='stitch'/>
                            </filter>
                            
                            <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
                        </svg>
                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">{`${((8.2/50)*100).toFixed(2)}%` }</span>
                            </div>
                          
                            <h6 className="card-title mb-1">
                              Storage Used
                            </h6>
                            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                              {`${formatSmart(storageUsed)}GB used of ${storageAlloc}GB total`}
                            </p>
                          </div>
                          <div>
                            <div className="chart-container-halfdoughnut">
                              <Doughnut 
                                // data={data} 
                                data={storageData} 
                                width={"100%"}
                                options={{
                                  maintainAspectRatio: true,
                                  animation: {
                                    duration: 200,
                                    easing: 'easeOutCubic',
                                    animateRotate: true,
                                    animateScale: true,
                                  },
                                  layout: { padding: { top: 5, left: 5, right: 5 } },
                                  rotation: -ARC_DEG / 2,      // center arc at top
                                  circumference: ARC_DEG,     // e.g. 240
                                  cutout: '70%',
                                  animations: { x: { duration: 150 }, y: { duration: 150 }, resize: { duration: 0 } },
                                  aspectRatio: 1,
                                  plugins: {
                                    legend: {
                                      display: false, // Hide legend
                                    },
                                    tooltip: {
                                      callbacks: {
                                          label: function(context) {
                                              console.log("context:", context);
                                              let label = context.dataset.label || '';

                                              if (label) {
                                                  label += '';
                                              }
                                              if (context.parsed.y !== null) {
                                                  label += context.parsed.y;
                                              }
                                              // Add your custom text here
                                              label += 'GB'; 
                                              return label;
                                          }
                                      }
                                    },
                                    datalabels: {
                                      display: false,
                                    }
                                  },
                                }}
                                responsive={true}
                                id={"Email-halfDoughnut-Chart"}
                              />
                              <div className="chart-center-text">
                                <h5 className="highlight">
                                  {formatSmart(storageUsed)}
                                  <small className="highlight-sm fs-6 align-middle"> /GB</small>
                                </h5>
                              </div>
                            </div>
                            <h3 className="fw-bold mb-1 highlight" style={{ fontSize: "2rem" }}>
                              {`${formatSmart(storageRemainingGB)}`}
                              <small className="highlight-sm fs-6 align-middle"> /GB Remaining</small>
                            </h3>
                            <div className="progress progress-thin thin">
                              <div className="progress-bar bg-mavsketch" style={{ width: `${storageRemainingPercent}%` }}>
                                {/* {8.2 > 8 ? <div className="status-highlight">8.2GB</div> : ""} */}
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>{`${((8.2/50)*100).toFixed(2)}%`}</span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* --Email Capacity-- */}
                  <Col xs={12} md={4} lg={4} xl={4}>
                    <div className="anim-card-wrapper dark-bg cap-xl">
                      <div className="anim-card">
                        <div className="border-shadow-top"></div>
                        <div className="border-shadow-right"></div>
                        <div className="border-shadow-bottom"></div>
                        <div className="border-shadow-left"></div>
                        <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
                            <filter id='noiseFilter'>
                              <feTurbulence 
                                type='fractalNoise' 
                                baseFrequency='20.43' 
                                numOctaves='400' 
                                stitchTiles='stitch'/>
                            </filter>
                            
                            <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
                        </svg>
                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">{`${((8.2/50)*100).toFixed(2)}%` }</span>
                            </div>
                            <h6 className="card-title mb-1">
                              Email Capacity
                            </h6>
                            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                              {`13 used of 14 accounts total`}
                            </p>
                          </div>
                          <div>
                            <div className="chart-container-doughnut">
                              <Doughnut 
                                // data={data} 
                                data={chartData} 
                                width={"100%"}
                                options={{ 
                                  maintainAspectRatio: true,
                                  animation: {
                                  duration: 200,            // overall duration (ms) — reduce to make it snappy
                                  easing: 'easeOutCubic',   // faster feeling easing
                                  animateRotate: true,
                                  animateScale: true,
                                  // delay: 0                 // optional explicit delay
                                },
                                animations: {
                                  // length of animated transitions for x/y/tension/etc.
                                  x: { duration: 150, easing: 'easeOutCubic' },
                                  y: { duration: 150, easing: 'easeOutCubic' },
                                  // prevent slow resize animation
                                  resize: { duration: 0 }
                                },
                                  aspectRatio: 1,
                                  plugins: {
                                    legend: {
                                      display: false, // Hide legend
                                    },
                                    datalabels: {
                                      color: '#fff',
                                      anchor: 'center',
                                      align: 'center',
                                      formatter: (value, context) => {
                                        console.log(context);
                                        const idx = context?.dataIndex;
                                        const labels = context?.chart?.data?.labels || [];
                                        const label = labels[idx] ?? '';
                                        const CustomLabels = context?.chart?.data?.datasets[0]?.customLabel || [];
                                        const customLabel = CustomLabels[idx] || '';
                                        return customLabel ? `${customLabel}` : String(value);
                                      },
                                      anchor: 'center', // Position the label in the center of the slice
                                      align: 'center', // Align the text within the label
                                    },
                                  },
                                }}
                                responsive={true}
                                id={"Email-Doughnut-Chart"}
                              />
                              <div className="chart-center-text">
                                <h5 className="highlight">
                                  {
                                      (totalStorageGB).toFixed(1)
                                    }
                                  <small className="highlight-sm fs-6 align-middle"> /GB</small>
                                </h5>
                              </div>
                            </div>
                            <div className="label-wrapper">
                              {chartData?.labels?.map((label, index) => {
                                const bg = chartData?.datasets?.[0]?.backgroundColor;
                                const color = Array.isArray(bg) ? bg[index] : bg || '#ccc';
                                const bgBorder = chartData?.datasets?.[0]?.borderColor;
                                const colorBorder = Array.isArray(bgBorder) ? bgBorder[index] : bgBorder || '#ccc';
                                return (
                                  <div key={index} className="label-item">
                                    <span
                                      className="label-color"
                                      style={{
                                        display: 'inline-block',
                                        width: 10,
                                        height: 10,
                                        borderRadius: 999,
                                        background: color,
                                        border: `1px solid ${colorBorder}`,
                                        boxShadow: '0 0 0 2px rgba(0,0,0,0.03) inset',
                                      }}
                                    />
                                    <span className="label-text">{label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>{`${((13/14)*100).toFixed(2)}%`}</span>
                      </figcaption>
                    </div>
                  </Col>
                </Row>

              </Col>
              
              {/* Second row */}
              <Col xs={12} md={12} lg={12} xl={3}>
              
                {/* ---------- NEW ROW: TEMPLATE CHOOSER ---------- */}
                <Row className="g-4 mt-2" style={{height: "100%"}}>
                  <Col xs={12}>
                    <TemplateChooserCard
                      onOpenEditor={() =>
                        homePageId
                          ? router.push(`/editorpages/page/${homePageId}`)
                          : alert("Home page not found yet.")
                      }
                    />
                  </Col>
                </Row>      

              </Col>


            </Row>

            
            

            {/* <Row className="mt-4">
              <Col xs={12}>
                <Card className="custom-card-shadow border-0 rounded-4" style={cardGlass}>
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4" style={{ fontSize: "1.05rem" }}>
                      Recent Activity
                    </h5>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-3 d-flex align-items-start gap-3">
                        <Image
                          src="/images/user1.jpg"
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-circle object-fit-cover"
                        />
                        <div>
                          <strong>Sarah Johnson</strong> published a new article “Design Systems in 2023”
                          <br />
                          <small className="text-muted">2 hours ago</small>
                        </div>
                      </li>
                      <li className="mb-3 d-flex align-items-start gap-3">
                        <img
                          src="/images/user2.jpg"
                          alt=""
                          width="40"
                          height="40"
                          className="rounded-circle object-fit-cover"
                        />
                        <div>
                          <strong>Robert Chen</strong> updated the homepage banner
                          <br />
                          <small className="text-muted">4 hours ago</small>
                        </div>
                      </li>
                      <li className="d-flex align-items-start gap-3">
                        <img
                          src="/images/user3.jpg"
                          alt=""
                          width="40"
                          height="40"
                          className="rounded-circle object-fit-cover"
                        />
                        <div>
                          <strong>Jessica Lee</strong> commented on “UX Design Fundamentals”
                          <br />
                          <small className="text-muted">Yesterday at 2:45 PM</small>
                        </div>
                      </li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row> */}
          </Container>
        </main>
      </div>
      {isCompact && showMenu && (
        <div className="mobile-backdrop" onClick={() => setShowMenu(false)} />
      )}
    </>
  );
}












