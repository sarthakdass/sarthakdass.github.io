#!/usr/bin/env python3
"""Writes projects/taxi-tip-prediction.html (the NYC Yellow Taxi Tip Prediction write-up) in the site shell.

Run from the site root:  python3 tools/build_taxi_page.py
Re-run it whenever the nav or footer in build_pages.py changes, so this page stays in step with the others.
The interactive parts live in js/taxi.js (data in js/taxi-data.js, built by tools/prep_taxi_data.py).
"""
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root)
os.chdir(root)
from build_pages import project_shell, title_markup  # noqa: E402

MATHJAX = r"""<script>
  window.MathJax = {
    tex: { inlineMath: [["\\(", "\\)"]], displayMath: [["\\[", "\\]"]] },
    options: { skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"] },
    startup: {
      pageReady: function () {
        return MathJax.startup.defaultPageReady().then(function () {
          var panels = document.querySelectorAll(".formula");
          for (var i = 0; i < panels.length; i++) panels[i].classList.add("ready");
        });
      }
    }
  };
</script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
"""

DESCRIPTION = ("How much of a rider&rsquo;s tip can you predict from the trip alone? A C++ decision tree, trained on one "
               "month of New York taxi data and tested on months it never saw, plus an interactive map of where "
               "riders tip.")

STAGE = f"""    <a class="back-link" href="./">&larr; Back to projects</a>
    <h1 class="page-title page-title--long reveal">{title_markup("NYC Yellow Taxi Tip Prediction Model")}</h1>
    <p class="stage__lede stage__lede--wide">{DESCRIPTION}</p>
    <div class="contact">
      <a class="btn btn--solid" href="https://github.com/sarthakdass/taxi-ml" target="_blank" rel="noopener">Source <span aria-hidden="true">&nearr;</span></a>
    </div>"""

CONTENT = r"""      <p class="tx-lead">Once the data errors are stripped away, how much of a rider&rsquo;s tipping can be predicted from the trip alone? To find out, I cleaned the raw January 2025 New York yellow taxi records, trained a decision tree in C++ with mlpack on 80% of that one month, and then tested it on February and December.</p>

      <div class="tx-stats" role="list">
        <div role="listitem"><b>75.5%</b><span>accuracy on held-out trips, against 62.4% for always guessing &ldquo;generous&rdquo;</span></div>
        <div role="listitem"><b>+12.7 and +16.6</b><span>points over that baseline on February and December</span></div>
        <div role="listitem"><b>2.34M</b><span>clean trips, kept out of 3.48M raw rows in January</span></div>
        <div role="listitem"><b>31</b><span>features, including smoothed zone tip rates fitted on training rows only</span></div>
      </div>

      <section class="tx-sec" aria-labelledby="tx-h-label">
        <h2 id="tx-h-label">What counts as a generous tip?</h2>
        <p>A trip is <em>generous</em> if the tip is more than a set share of the fare. I chose 25% from the data. Try the three cutoffs I compared (based on the three tip options shown on a taxi screen):</p>
        <div class="tx-card" id="tx-threshold">
          <div class="tx-seg" role="group" aria-label="Tip cutoff">
            <button type="button" data-th="20" aria-pressed="false">20%</button>
            <button type="button" data-th="25" aria-pressed="true">25%</button>
            <button type="button" data-th="30" aria-pressed="false">30%</button>
          </div>
          <div class="tx-bigrow"><b id="tx-th-val">62.5%</b><span id="tx-th-label"></span></div>
          <div class="tx-meter" aria-hidden="true"><span id="tx-th-fill" class="tx-fill-static"></span></div>
          <p class="tx-th-text" id="tx-th-text" aria-live="polite"></p>
          <p class="tx-small">Where tips actually fall, as a percentage of the fare (January, card trips). The vertical line is the cutoff we picked.</p>
          <div class="tx-quantrail" aria-hidden="true"><span class="tx-mark" id="tx-th-mark"></span><div id="tx-quant"></div></div>
        </div>
        <p>Every number below is reported next to its always-&ldquo;generous&rdquo; baseline, and the <em>lift</em> over that baseline is the figure to watch.</p>
      </section>

      <section class="tx-sec" aria-labelledby="tx-h-noise">
        <h2 id="tx-h-noise">Finding signal in noise</h2>
        <p>About a third of the raw January file is unusable for studying tips. Cash payments record every tip as $0, and the file also holds sub-minimum fares, zero-distance rides, impossible speeds, unmapped zones and phantom durations. I removed them with documented rules, applied the same way to every month. I also left out <code>total_amount</code>, because it contains the tip and would leak the answer.</p>
        <div class="tx-card">
          <p class="tx-cap">Rows removed from January 2025, out of 3,475,226 (the categories overlap)</p>
          <div class="tx-chart" id="tx-noise"></div>
        </div>
        <p>That left <strong>2,340,066</strong> clean trips (67.3%). February keeps 62.5% of its rows and December 55.3%; why retention differs by month is something I did not investigate.</p>
        <ol class="tx-flow" aria-label="Pipeline">
          <li><b>TLC Parquet</b><span>one file per month</span></li>
          <li><b>DuckDB</b><span>cleaning rules, in Python</span></li>
          <li><b>mlpack</b><span>decision tree and regression, in C++ with CMake</span></li>
          <li><b>geopandas + folium</b><span>zone maps</span></li>
        </ol>
      </section>

      <section class="tx-sec" aria-labelledby="tx-h-tree">
        <h2 id="tx-h-tree">The decision tree</h2>
        <p>Tipping depends on interactions (an airport pickup at midnight is not simply &ldquo;airport&rdquo; plus &ldquo;midnight&rdquo;) and on thresholds like fare size, and a tree handles both without any scaling. I used mlpack&rsquo;s <code>DecisionTree</code> with Gini impurity, depth 12 and at least 100 rows per leaf. At each node it picks the split with the largest drop in impurity:</p>
        <div class="formula">\[ G = 1 - \sum_k p_k^2, \qquad \Delta G = G_{\text{parent}} - \sum_{c} \frac{n_c}{n}\,G_c . \]</div>
        <p>The 31 features are the raw trip fields plus engineered flags for airports, Midtown, rush hour and weekend nights, and the smoothed share of generous tips in each pickup and dropoff zone. That target encoding of zone \(z\), with \(m = 50\) pseudo-trips pulling small zones toward the overall rate \(\bar p\), is</p>
        <div class="formula">\[ \operatorname{enc}(z) = \frac{\sum_{i \in z} y_i + m\,\bar{p}}{n_z + m}, \]</div>
        <p>and it is fitted on training rows only, so nothing about the test trips leaks in. The tree was trained once, on 80% of January, and then scored on data it had not seen:</p>
        <div class="tx-card">
          <p class="tx-cap">Accuracy of the decision tree against always answering &ldquo;generous&rdquo;</p>
          <div class="tx-chart" id="tx-results"></div>
        </div>
        <p>Train and hold-out accuracy differ by 0.1 point, so it is not overfitting. However, the lift holds up on both unseen months which is reasonably strong evidence that the signal is real. December is the best month, but its class balance is different, so lift and AUC are the fair comparisons across months.</p>
      </section>

      <section class="tx-sec" aria-labelledby="tx-h-reg">
        <h2 id="tx-h-reg">Linear Regression baseline</h2>
        <p>To see how far a simple additive model gets, I also fit mlpack&rsquo;s <code>LinearRegression</code> to the tip in dollars, using 82 features: 9 numeric ones plus one-hot hour, day, rate code and the 20 busiest pickup and dropoff zones. One reference category per group is dropped so the design matrix has full rank, and zones are treated as categories (since numbers would be completely nonsensical). Three nested models show what each group of features adds:</p>
        <div class="tx-card">
          <p class="tx-cap">R&sup2; on held-out January trips, predicting the tip in dollars</p>
          <div class="tx-chart" id="tx-r2"></div>
        </div>
        <p>Fare alone explains most of the tip (R&sup2; = 0.582). The other 81 features add about 0.017. Used as a &ldquo;generous tip&rdquo; classifier, the regression is clearly worse than the tree:</p>
        <div class="tx-card">
          <p class="tx-cap">Accuracy on the same question (tip above 25% of the fare), January hold-out</p>
          <div class="tx-chart" id="tx-cls"></div>
        </div>
        <p>The label depends on a ratio and on interactions, which one additive dollar model handles poorly. So the regression is a useful baseline and a way to read effects, but not a way to predict generosity.</p>
      </section>

      <section class="tx-sec" aria-labelledby="tx-h-map">
        <h2 id="tx-h-map">Where you are matters more than when</h2>
        <p>Here is the model&rsquo;s view of the city, by pickup zone. Switch layers, hover or tap a zone for its numbers, and zoom into Manhattan. The January layers compare the model with reality on trips it never trained on. The February layers use a month it never saw, and compare weekday mornings with Friday and Saturday nights. The color spectrum legend is below.</p>

        <div class="tx-card tx-card--map">
          <div class="tx-layers" id="tx-layers"></div>
          <div class="tx-mapgrid">
            <div class="tx-mapwrap">
              <div class="tx-map" id="tx-map"></div>
              <div class="tx-zoom">
                <button type="button" id="tx-zin" aria-label="Zoom in">+</button>
                <button type="button" id="tx-zout" aria-label="Zoom out">&minus;</button>
                <button type="button" id="tx-zcore">Reset</button>
                <button type="button" id="tx-zman">Manhattan</button>
                <button type="button" id="tx-zall">All zones</button>
              </div>
            </div>
            <aside class="tx-info" id="tx-info" aria-live="polite"></aside>
          </div>
          <div class="tx-legend" id="tx-legend"></div>
        </div>

        <p>We can clearly see that location dominates trends. JFK pickups are generous only about 11&ndash;12% of the time, while Midtown is around 63&ndash;67%, a gap of more than 50 points that no time of day comes close to. The two airports behave oppositely: JFK is low and flat, but LaGuardia tips like Manhattan and then drops 7 to 9 points on weekend nights. Here are the numbers behind the February layers, by pickup group:</p>
        <div class="tx-card">
          <p class="tx-cap">Actual share of generous tips in February. The thin line on each bar is the model&rsquo;s average predicted probability.</p>
          <div class="tx-chart" id="tx-groups"></div>
        </div>
        <p>Time of day maybe matters slightly at best, with the glaring exception of LaGuardia on weekend nights. Outside Midtown, the rest of Manhattan is a little more generous at night. The model&rsquo;s predicted changes track the actual ones to within about 2 points.</p>
      </section>

      <section class="tx-sec" aria-labelledby="tx-h-neg">
        <h2 id="tx-h-neg">What did not help</h2>
        <p>There were several failed experiments which I outline below. Each idea was tested against the tree&rsquo;s baseline, yet none moved accuracy by more than 0.3 points:</p>
        <ul class="tx-list">
          <li><strong>Deeper or looser trees.</strong> Depths 8 to 20 all landed between 74.7% and 75.1%, and depth 20 overfits. The ceiling comes from what trip data can say but certainly not from the model.</li>
          <li><strong>Zone target encoding.</strong> It added nothing on top of the airport and Midtown flags, because fare, tolls and fees already act as location proxies.</li>
          <li><strong>Relaxing the label.</strong> Counting tips that round to exactly 25% moved accuracy up 0.2 points, but the baseline rose with it, so the lift was unchanged.</li>
          <li><strong>The taxi terminal vendor.</strong> Vendor 1 riders were generous 61.15% of the time and vendor 2 riders 61.33%, indicating no distinction between the two main vendors so I did not add it.</li>
        </ul>
        <p><strong>Important pitfall.</strong> mlpack&rsquo;s decision tree rejects a categorical split unless every category has at least the minimum leaf size in the node. Declaring zone IDs as 264 categories meant that zone 0, which never occurs, blocked every split on zone. On a synthetic test where tipping depended only on the pickup zone, accuracy was 50% (chance) with categorical zones and 90% (the ceiling) after switching to target-encoded zone rates. On the real data the gain was small, because other features already stood in for location, but I definitely learned to check if every feature I declare can actually be split.</p>
        <p>And finally, if you wish, you can look at my source code to try training the tree and make live predictions!</p>
      </section>

      <aside class="credit tx-credit">
        <h2>Data and limits</h2>
        <p>Trip data comes from the NYC Taxi &amp; Limousine Commission (TLC) yellow taxi trip records for 2025, and the zone boundaries from the TLC taxi zone shapefile. Everything here covers card payments only, since cash tips are not recorded, and it describes patterns, not causes. The maps are drawn from the project&rsquo;s own folium output, rebuilt for this page. The full write-up, code, and instructions to reproduce every number are in my <a href="https://github.com/sarthakdass/taxi-ml" target="_blank" rel="noopener">sarthakdass/taxi-ml</a> repository.</p>
      </aside>"""

html = project_shell(
    "NYC Yellow Taxi Tip Prediction Model — Sarthak Dassarma",
    STAGE,
    CONTENT,
    head_extra=MATHJAX,
    body_end='<script src="../js/taxi-data.js" defer></script>\n<script src="../js/taxi.js" defer></script>',
)
with open("projects/taxi-tip-prediction.html", "w", encoding="utf-8") as f:
    f.write(html)
print("wrote projects/taxi-tip-prediction.html", len(html), "bytes")
