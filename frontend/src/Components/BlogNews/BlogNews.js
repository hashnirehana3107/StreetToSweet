import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BlogNews.css";

const BlogNews = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null); // modal state

  const categories = [
    { value: "all", label: "All Posts" },
    { value: "rescue", label: "Rescue Stories" },
    { value: "adoption", label: "Adoption Updates" },
    { value: "event", label: "Event Coverage" },
    { value: "volunteer", label: "Volunteer Stories" },
    { value: "health", label: "Health & Awareness" }
  ];

  // Mock blog data
  const mockBlogs = [
    {
      _id: "1",
      title: "Bruno’s Rescue Journey",
      content:
        "Bruno was found injured on the street but is now recovering happily at our shelter. Our team worked tirelessly to provide him the treatment and care he needed. Today, Bruno is not only safe but also enjoying his playful nature again.",
      snippet: "Bruno was found injured but is now recovering happily...",
      author: "Anna",
      category: "rescue",
      date: new Date().toISOString(),
      image:
        "https://ichef.bbci.co.uk/news/976/cpsprodpb/14859/production/_128575048_colin-wide-1.jpg"
    },
    {
      _id: "2",
      title: "Happy Adoption: Bella Finds a Home",
      content:
        "Bella, a lovely pup, was adopted by a kind family and now enjoys a safe, loving home. She has adapted quickly and shares a strong bond with her new family members. This is what makes adoption so special.",
      snippet: "Bella was adopted by a kind family...",
      author: "Jhon",
      category: "adoption",
      date: new Date().toISOString(),
      image:
        "https://assets.telegraphindia.com/abp/2023/Sep/1694529696_untitled-design-2023-09-12t201123-410.jpg"
    },
    {
      _id: "3",
      title: "Volunteer Day: Feeding Street Dogs",
      content:
        "Our volunteers spent a day feeding and caring for stray dogs across the city. This initiative helps build trust with the dogs and ensures they receive a meal, love, and medical check when needed.",
      snippet: "Volunteers cared for stray dogs across the city...",
      author: "Smith",
      category: "volunteer",
      date: new Date().toISOString(),
      image:
        "https://i.natgeofe.com/n/c322f3cc-118e-4265-9c43-1799d038fd3c/india-stray-dogs-1.jpg"
    },
    {
      _id: "4",
      title: "Health Tips: Caring for Street Dogs",
      content:
        "Learn how to provide basic first aid and vaccinations for rescued street dogs. Prevention is always better than cure, and timely care saves many lives.",
      snippet: "Basic first aid and vaccination tips...",
      author: "Jhon",
      category: "health",
      date: new Date().toISOString(),
      image:
        "https://imgeng.jagran.com/images/2024/feb/feeding-street-dog-benefits-astrology1709020064169.jpg"
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setBlogs(mockBlogs);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.content.toLowerCase().includes(search.toLowerCase()) ||
      blog.author.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || blog.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleWriteBlogClick = () => {
    alert("Blog writing is available for registered volunteers and staff.");
  };

  return (
    <div className="blog-page">
      <header className="blog-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-paw"></i> Blog & News
          </h1>
          <p>
            Read inspiring rescue stories, adoption updates, and shelter news
            from our community.
          </p>

          <div className="search-filter-container">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="category-filter">
              <label htmlFor="category-select">Filter by:</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="blog-actions">
        <button className="write-blog-btn" onClick={handleWriteBlogClick}>
          <i className="fas fa-pencil-alt"></i> Share Your Story
        </button>
        <p className="blog-count">{filteredBlogs.length} blog posts found</p>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blog posts...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="no-blogs">
          <i className="fas fa-file-alt"></i>
          <h3>No blog posts found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="blog-grid">
          {filteredBlogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              <div className="blog-image">
                <img
                  src={blog.image}
                  alt={blog.title}
                  onError={(e) => {
                    e.target.src = "/default-blog.png";
                  }}
                />
                <span className="blog-category">{blog.category}</span>
              </div>

              <div className="blog-content">
                <h3>{blog.title}</h3>
                <p className="blog-snippet">
                  {blog.snippet ||
                    blog.content.substring(0, 100) + "..."}
                </p>

                <div className="blog-meta">
                  <div className="author-info">
                    <i className="fas fa-user"></i>
                    <span>{blog.author}</span>
                  </div>
                  <div className="date-info">
                    <i className="fas fa-calendar-alt"></i>
                    <span>{new Date(blog.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div
                  className="read-more"
                  onClick={() => setSelectedBlog(blog)}
                >
                  Read More <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Modal Popup ===== */}
{/* ===== Modal Popup ===== */}
{selectedBlog && (
  <div className="blog-news-modal">
    <div className="blog-news-modal-content">
      {/* Close Button */}
      <button
        className="b-n-close-modal"
        onClick={() => setSelectedBlog(null)}
      >
        <i className="fas fa-times"></i> ⛌
      </button>

      <div className="b-n-modal-image">
        <img src={selectedBlog.image} alt={selectedBlog.title} />
      </div>

      <h2>{selectedBlog.title}</h2>
      <p className="b-n-modal-meta">
        <i className="fas fa-user"></i> {selectedBlog.author} |{" "}
        <i className="fas fa-calendar-alt"></i>{" "}
        {new Date(selectedBlog.date).toLocaleDateString()}
      </p>
      <p className="b-n-modal-content-text">{selectedBlog.content}</p>
    </div>
  </div>
)}

     
    </div>
  );
};

export default BlogNews;
