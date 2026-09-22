<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>

<xsl:template match="/">
  <html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>
      <xsl:choose>
        <xsl:when test="sm:sitemapindex">Sitemap Index — salary-calc.co.uk</xsl:when>
        <xsl:otherwise>Sitemap — salary-calc.co.uk</xsl:otherwise>
      </xsl:choose>
    </title>
    <style>
      :root{
        --govgreen:#00703c;
        --govblue:#1d70b8;
        --govblack:#0b0c0c;
        --govyellow:#ffdd00;
        --govgrey:#f3f2f1;
        --govborder:#b1b4b6;
      }
      *{ box-sizing:border-box; }
      body{
        margin:0;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
        background:#fff;
        color:var(--govblack);
      }
      .topbar{
        background:var(--govblack);
        color:#fff;
        padding:1.5rem 1.25rem;
      }
      .topbar-inner{
        max-width:1000px;
        margin:0 auto;
      }
      .topbar h1{
        margin:0 0 0.35rem;
        font-size:1.4rem;
        font-weight:700;
      }
      .topbar p{
        margin:0;
        color:rgba(255,255,255,0.75);
        font-size:0.9rem;
      }
      .badge{
        display:inline-block;
        background:var(--govgreen);
        color:#fff;
        font-size:0.7rem;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:0.04em;
        padding:0.15rem 0.5rem;
        border-radius:3px;
        margin-left:0.6rem;
        vertical-align:middle;
      }
      .wrap{
        max-width:1000px;
        margin:0 auto;
        padding:1.5rem 1.25rem 3rem;
      }
      .meta-row{
        display:flex;
        flex-wrap:wrap;
        gap:0.75rem;
        align-items:center;
        justify-content:space-between;
        margin-bottom:1rem;
      }
      .count-pill{
        background:var(--govgrey);
        border:1px solid var(--govborder);
        border-radius:20px;
        padding:0.35rem 0.9rem;
        font-size:0.85rem;
        font-weight:600;
        color:var(--govblack);
      }
      #search{
        border:2px solid var(--govblack);
        padding:0.5rem 0.8rem;
        font-size:0.95rem;
        min-width:240px;
        flex:1 1 240px;
      }
      #search:focus{ outline:3px solid var(--govyellow); outline-offset:0; }
      table{
        width:100%;
        border-collapse:collapse;
        font-size:0.9rem;
        border:1px solid var(--govborder);
      }
      thead th{
        text-align:left;
        background:var(--govgrey);
        border-bottom:2px solid var(--govblack);
        padding:0.7rem 0.9rem;
        font-weight:700;
        font-size:0.75rem;
        text-transform:uppercase;
        letter-spacing:0.04em;
        color:#505a5f;
      }
      tbody td{
        padding:0.65rem 0.9rem;
        border-bottom:1px solid var(--govborder);
        vertical-align:top;
      }
      tbody tr:nth-child(even){ background:#fafafa; }
      tbody tr:hover{ background:var(--govgrey); }
      td.idx{ color:#505a5f; width:2.5rem; }
      a.loc-link{
        color:var(--govblue);
        text-decoration:none;
        word-break:break-all;
      }
      a.loc-link:hover{ text-decoration:underline; }
      .arrow-icon{
        display:inline-block;
        width:14px;
        height:14px;
        margin-right:0.4rem;
        vertical-align:-2px;
      }
      .empty-msg{
        display:none;
        padding:2rem;
        text-align:center;
        color:#505a5f;
      }
      footer{
        max-width:1000px;
        margin:2rem auto 0;
        padding:0 1.25rem;
        font-size:0.8rem;
        color:#505a5f;
      }
      footer a{ color:var(--govblue); }
      @media (max-width:600px){
        .topbar h1{ font-size:1.15rem; }
        #search{ min-width:100%; }
      }
    </style>
  </head>
  <body>

    <xsl:choose>
      <!-- ============ SITEMAP INDEX ============ -->
      <xsl:when test="sm:sitemapindex">
        <div class="topbar">
          <div class="topbar-inner">
            <h1>Sitemap Index<span class="badge">XML</span></h1>
            <p>salary-calc.co.uk — index of <xsl:value-of select="count(sm:sitemapindex/sm:sitemap)"/> sub-sitemaps</p>
          </div>
        </div>
        <div class="wrap">
          <div class="meta-row">
            <span class="count-pill"><xsl:value-of select="count(sm:sitemapindex/sm:sitemap)"/> sitemap file(s)</span>
            <input id="search" type="text" placeholder="Filter sitemaps..." oninput="filterRows(this.value)"/>
          </div>
          <table id="sitemap-table">
            <thead>
              <tr>
                <th style="width:3rem;">#</th>
                <th>Sitemap URL</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sm:sitemapindex/sm:sitemap">
                <tr>
                  <td class="idx"><xsl:value-of select="position()"/></td>
                  <td>
                    <a class="loc-link" target="_blank" rel="noopener">
                      <xsl:attribute name="href"><xsl:value-of select="sm:loc"/></xsl:attribute>
                      <xsl:value-of select="sm:loc"/>
                    </a>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <div class="empty-msg" id="empty-msg">No sitemaps match your search.</div>
        </div>
      </xsl:when>

      <!-- ============ URL SET ============ -->
      <xsl:otherwise>
        <div class="topbar">
          <div class="topbar-inner">
            <h1>XML Sitemap<span class="badge">XML</span></h1>
            <p>salary-calc.co.uk — <xsl:value-of select="count(sm:urlset/sm:url)"/> URLs listed for search engines</p>
          </div>
        </div>
        <div class="wrap">
          <div class="meta-row">
            <span class="count-pill"><xsl:value-of select="count(sm:urlset/sm:url)"/> URL(s)</span>
            <input id="search" type="text" placeholder="Filter URLs..." oninput="filterRows(this.value)"/>
          </div>
          <table id="sitemap-table">
            <thead>
              <tr>
                <th style="width:3rem;">#</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sm:urlset/sm:url">
                <tr>
                  <td class="idx"><xsl:value-of select="position()"/></td>
                  <td>
                    <a class="loc-link" target="_blank" rel="noopener">
                      <xsl:attribute name="href"><xsl:value-of select="sm:loc"/></xsl:attribute>
                      <xsl:value-of select="sm:loc"/>
                    </a>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <div class="empty-msg" id="empty-msg">No URLs match your search.</div>
        </div>
      </xsl:otherwise>
    </xsl:choose>

    <footer>
      Generated automatically for search engine crawlers. This page is styled with an XSL stylesheet for readability — the underlying file is still a valid, standard XML sitemap.
    </footer>

    <script>
      function filterRows(q) {
        q = q.toLowerCase();
        var rows = document.querySelectorAll('#sitemap-table tbody tr');
        var visible = 0;
        rows.forEach(function(r){
          var match = r.textContent.toLowerCase().indexOf(q) !== -1;
          r.style.display = match ? '' : 'none';
          if (match) visible++;
        });
        document.getElementById('empty-msg').style.display = visible === 0 ? 'block' : 'none';
      }
    </script>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>
