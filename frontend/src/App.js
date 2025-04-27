import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://localhost:5000";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/urls`);
      setShortenedUrls(response.data);
    } catch (err) {
      console.error("Error fetching URLs:", err);
      setError("Failed to fetch URL history");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCopySuccess("");

    if (!originalUrl) {
      setError("Please enter a URL");
      return;
    }

    try {
      new URL(originalUrl);
    } catch (err) {
      setError("Please enter a valid URL (include http:// or https://)");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/shorten`, {
        originalUrl,
      });

      setShortenedUrls([response.data, ...shortenedUrls]);
      setOriginalUrl("");
    } catch (err) {
      console.error("Error shortening URL:", err);
      setError("Failed to shorten URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (shortUrl) => {
    navigator.clipboard
      .writeText(`${API_BASE_URL}/${shortUrl}`)
      .then(() => {
        setCopySuccess("Copied to clipboard!");
        setTimeout(() => setCopySuccess(""), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
        setError("Failed to copy URL");
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Shortener</h1>
        <p>Shorten your long URLs into compact, easy-to-share links</p>
      </header>

      <main>
        <section className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter long URL (e.g., https://example.com/very/long/url)"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Shortening..." : "Shorten URL"}
              </button>
            </div>
            {error && <p className="error">{error}</p>}
            {copySuccess && <p className="success">{copySuccess}</p>}
          </form>
        </section>

        <section className="urls-section">
          <h2>Your Shortened URLs</h2>
          {shortenedUrls.length === 0 ? (
            <p>No URLs shortened yet</p>
          ) : (
            <ul className="url-list">
              {shortenedUrls.map((url) => (
                <li key={url.shortCode} className="url-item">
                  <div className="url-details">
                    <p className="original-url">
                      <span>Original:</span> {url.originalUrl}
                    </p>
                    <p className="short-url">
                      <span>Shortened:</span>
                      <a
                        href={`${API_BASE_URL}/${url.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {`${API_BASE_URL}/${url.shortCode}`}
                      </a>
                    </p>
                    <p className="stats">
                      <span>Clicks:</span> {url.clicks} |<span>Created:</span>{" "}
                      {new Date(url.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(url.shortCode)}
                  >
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
