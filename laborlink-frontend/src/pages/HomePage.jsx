import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="homepage">
      {/* Background gradients for visual appeal */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>

      {/* Navbar */}
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ cursor: "pointer" }}>
          <div className="logo-icon">📍</div>
          <div className="logo-text">
            <span>Skill</span>Local
            <small>Local Jobs. Skilled People. Stronger Communities.</small>
          </div>
        </div>

        <ul className="nav-links">
          <li onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</li>
          <li onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How It Works</li>
          <li onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}>Reviews</li>
        </ul>

        <div className="navbar-actions">
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="signup-btn"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-tag">✨ Connecting Local Talents</div>
          <h1 className="hero-bold-title">
            Hyperlocal <br />
            Skilled Labour <br />
            <span>Workplace</span>
          </h1>

          <p className="hero-description">
            Connecting skilled workers with local job opportunities and customers who need reliable service right away.
          </p>

          <div className="hero-quote">
            "Empowering skilled workers, creating opportunities, connecting communities."
          </div>

          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">📍</span>
              <span>Local Jobs Near You</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Trusted & Verified</span>
            </div>
          </div>
          
          <div className="hero-actions">
            <button className="cta-primary-btn" onClick={() => navigate("/register")}>
              Join as Worker
            </button>
            <button className="cta-secondary-btn" onClick={() => navigate("/login")}>
              Hire Professionals
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="image-card-wrapper">
            <img
              src="/homepic.png"
              alt="Workers"
            />
            <div className="floating-badge badge-top">
              <span className="badge-icon">⭐</span>
              <div>
                <strong>4.8 Rating</strong>
                <p>Top Rated Services</p>
              </div>
            </div>
            <div className="floating-badge badge-bottom">
              <span className="badge-icon">🛡️</span>
              <div>
                <strong>100% Secure</strong>
                <p>Verified Profiles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="categories-section">
        <h2 className="section-title">Popular Local Services</h2>
        <p className="section-subtitle">Find top-rated, vetted local professionals in your neighborhood</p>
        
        <div className="categories-grid">
          <div className="category-card" onClick={() => navigate("/login")}>
            <div className="cat-icon-wrapper plumbing">🔧</div>
            <h3>Plumbing</h3>
            <p>Leaks, tap replacement, and pipe installations</p>
            <span className="cat-availability">24+ Experts Active</span>
          </div>

          <div className="category-card" onClick={() => navigate("/login")}>
            <div className="cat-icon-wrapper electrical">⚡</div>
            <h3>Electrical</h3>
            <p>Wiring, appliance fixing, and lighting setup</p>
            <span className="cat-availability">18+ Experts Active</span>
          </div>

          <div className="category-card" onClick={() => navigate("/login")}>
            <div className="cat-icon-wrapper carpentry">🛠️</div>
            <h3>Carpentry</h3>
            <p>Furniture repairs, door fitting, and wood crafts</p>
            <span className="cat-availability">12+ Experts Active</span>
          </div>

          <div className="category-card" onClick={() => navigate("/login")}>
            <div className="cat-icon-wrapper painting">🎨</div>
            <h3>Painting</h3>
            <p>Wall painting, texture designs, and touch-ups</p>
            <span className="cat-availability">15+ Experts Active</span>
          </div>

          <div className="category-card" onClick={() => navigate("/login")}>
            <div className="cat-icon-wrapper ac">❄️</div>
            <h3>AC Repair</h3>
            <p>Cooling system service, gas filling & installations</p>
            <span className="cat-availability">9+ Experts Active</span>
          </div>

          <div className="category-card" onClick={() => navigate("/login")}>
            <div className="cat-icon-wrapper general">💼</div>
            <h3>General Labor</h3>
            <p>Home cleaning, loading, moving & general chores</p>
            <span className="cat-availability">30+ Experts Active</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <h2>500+</h2>
            <p>Customers Helped</p>
          </div>

          <div className="stat-card">
            <span className="stat-icon">💼</span>
            <h2>100+</h2>
            <p>Daily Opportunities</p>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <h2>4.8/5</h2>
            <p>Average Rating</p>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🛡️</span>
            <h2>100%</h2>
            <p>Verified Profiles</p>
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="quote-section">
        <div className="quote-container">
          <h2>Empowering skilled workers. Creating job opportunities. Helping communities grow.</h2>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-section" id="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Get things done in 4 simple steps</p>

        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <img src="/step_find.png" alt="Find workers" className="step-img" />
            <h3>Find</h3>
            <p>Browse skilled workers in your immediate neighborhood</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <img src="/step_connect.png" alt="Connect with workers" className="step-img" />
            <h3>Connect</h3>
            <p>Directly chat and discuss job requirements</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <img src="/step_book.png" alt="Book workers" className="step-img" />
            <h3>Book</h3>
            <p>Schedule a service at your convenient time</p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <img src="/step_done.png" alt="Done work" className="step-img" />
            <h3>Done</h3>
            <p>Work is completed safely with top-notch quality</p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="reviews" id="reviews">
        <h2 className="section-title">What Our Community Says</h2>
        <p className="section-subtitle">Real feedback from real users</p>

        <div className="review-columns">
          <div className="review-side">
            <h3 className="customer-title">💬 Customer Stories</h3>

            <div className="review-card">
              <h4>Ramesh K.</h4>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>
                "Amazing platform! Found a trusted plumber nearby within minutes. Highly recommended!"
              </p>
            </div>

            <div className="review-card">
              <h4>Priya S.</h4>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>
                "Very easy to use, and workers are highly skilled and polite. Saved me a lot of hassle."
              </p>
            </div>

            <div className="review-card">
              <h4>Anitha M.</h4>
              <div className="stars">⭐⭐⭐⭐½ <span style={{ color: "var(--accent-hover)", fontWeight: "bold", fontSize: "14px", marginLeft: "5px" }}>(4.5)</span></div>
              <p>
                "Extremely helpful local service directory. The booking process is very smooth."
              </p>
            </div>

            <div className="review-card">
              <h4>Kavitha R.</h4>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>
                "Highly satisfied with the carpentry work! Ramesh fixed my kitchen cabinets in an hour. Very clean and professional."
              </p>
            </div>

            <div className="review-card">
              <h4>Deepak M.</h4>
              <div className="stars">⭐⭐⭐⭐½ <span style={{ color: "var(--accent-hover)", fontWeight: "bold", fontSize: "14px", marginLeft: "5px" }}>(4.5)</span></div>
              <p>
                "Found an AC technician during a hot summer afternoon. He arrived within 45 minutes. Super prompt service!"
              </p>
            </div>
          </div>

          <div className="review-side">
            <h3 className="worker-title">👷 Worker Experiences</h3>

            <div className="review-card">
              <h4>Suresh T.</h4>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>
                "I get new job alerts every single day. This platform has completely changed my business!"
              </p>
            </div>

            <div className="review-card">
              <h4>Arun K.</h4>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>
                "This app helps me earn a better living locally. The customers are very friendly."
              </p>
            </div>

            <div className="review-card">
              <h4>Lakshmi P.</h4>
              <div className="stars">⭐⭐⭐⭐½ <span style={{ color: "var(--accent-hover)", fontWeight: "bold", fontSize: "14px", marginLeft: "5px" }}>(4.5)</span></div>
              <p>
                "A fantastic initiative for skilled labor. Highly recommended for finding direct work."
              </p>
            </div>

            <div className="review-card">
              <h4>Manoj S.</h4>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>
                "I used to wait in the local market square for daily jobs. Now, I get booked directly from home. This app is a lifesaver."
              </p>
            </div>

            <div className="review-card">
              <h4>Selvi R.</h4>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>
                "As a home painter, it was hard to find clients. SkillLocal connects me directly with local families. My earnings have doubled!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to build a stronger community?</h2>
          <p>Join thousands of skilled workers and happy customers in your neighborhood today.</p>
          <div className="cta-buttons">
            <button
              className="cta-primary-btn"
              onClick={() => navigate("/register")}
            >
              Get Started Now &nbsp; →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-col brand-col">
            <div className="logo">
              <span className="logo-icon">📍</span>
              <div className="logo-text">
                <span>Skill</span>Local
                <small>Hyperlocal Services Platform</small>
              </div>
            </div>
            <p className="footer-desc">
              Empowering skilled local professionals, linking neighbors, and strengthening communities through reliable services.
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</li>
              <li onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How It Works</li>
              <li onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}>Testimonials</li>
              <li onClick={() => navigate("/login")}>Login</li>
              <li onClick={() => navigate("/register")}>Sign Up</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact Us</h4>
            <p className="contact-item">📧 admin@gmail.com</p>
            <p className="contact-desc" style={{ fontSize: "14px", marginTop: "4px", color: "#94a3b8" }}>
              Contact us for any issues
            </p>
            <p className="contact-item" style={{ marginTop: "12px" }}>📞 +91 99999 99999</p>
            <p className="contact-item">📍 Chennai, Tamil Nadu, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SkillLocal Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;