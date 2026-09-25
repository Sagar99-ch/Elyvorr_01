import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <main className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1>Privacy Policy</h1>
          <p>Last Updated: September 2026</p>
        </div>

        <div className="privacy-content">
          <p>
            At <strong>ELYVORR PERFUME</strong>, we respect your privacy and are
            committed to protecting your personal information. This Privacy
            Policy explains how we collect, use, and protect your information
            when you visit or make a purchase from <strong>elyvorr.com</strong>.
          </p>

          <section>
            <h2>1. Information We Collect</h2>

            <p>
              When you visit our website or place an order, we may collect
              information such as:
            </p>

            <ul>
              <li>Full Name</li>
              <li>Mobile Number</li>
              <li>Email Address</li>
              <li>Shipping and Billing Address</li>
              <li>Payment and transaction details</li>
              <li>Order details</li>
              <li>Information you provide while contacting us</li>
            </ul>

            <p>
              We only collect information that is reasonably necessary to
              provide our services.
            </p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>

            <p>Your information may be used to:</p>

            <ul>
              <li>Process and deliver your orders</li>
              <li>Confirm your order and payment</li>
              <li>Contact you regarding your order</li>
              <li>Provide customer support</li>
              <li>Improve our products and website</li>
              <li>Send important updates related to your order or account</li>
              <li>Prevent fraud or unauthorized transactions</li>
            </ul>
          </section>

          <section>
            <h2>3. Payment Information</h2>

            <p>
              Payments may be processed through secure third-party payment
              gateways. ELYVORR PERFUME does not directly store your complete
              debit card, credit card, UPI PIN, CVV, or banking passwords.
            </p>

            <p>
              Payment information is handled by the respective payment service
              provider according to its privacy and security policies.
            </p>
          </section>

          <section>
            <h2>4. Sharing of Information</h2>

            <p>We do not sell or rent your personal information.</p>

            <p>
              We may share necessary information with trusted service providers,
              such as:
            </p>

            <ul>
              <li>Courier and delivery partners</li>
              <li>Payment gateway providers</li>
              <li>Website and technical service providers</li>
            </ul>

            <p>
              This information is shared only when necessary to provide our
              services or complete your order.
            </p>
          </section>

          <section>
            <h2>5. Cookies</h2>

            <p>
              Our website may use cookies and similar technologies to improve
              your browsing experience, remember preferences, and understand how
              visitors use our website.
            </p>

            <p>
              You can manage or disable cookies through your browser settings.
              However, disabling certain cookies may affect some website
              features.
            </p>
          </section>

          <section>
            <h2>6. Data Security</h2>

            <p>
              We take reasonable security measures to protect your personal
              information from unauthorized access, misuse, alteration, or
              disclosure.
            </p>

            <p>
              However, no method of internet transmission or electronic storage
              is completely secure, so we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>7. Third-Party Links</h2>

            <p>
              Our website may contain links to third-party websites or services.
              We are not responsible for the privacy practices or content of
              those third-party websites.
            </p>

            <p>
              We recommend reviewing their privacy policies before providing
              them with your personal information.
            </p>
          </section>

          <section>
            <h2>8. Children's Privacy</h2>

            <p>
              Our website is not intentionally designed to collect personal
              information from children without appropriate parental or guardian
              involvement.
            </p>
          </section>

          <section>
            <h2>9. Your Rights</h2>

            <p>
              Depending on applicable law, you may have the right to request
              access to, correction of, or deletion of your personal
              information.
            </p>

            <p>
              For any privacy-related request, you can contact us using the
              details provided below.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Privacy Policy</h2>

            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated "Last Updated" date.
            </p>
          </section>

          <section>
            <h2>11. Contact Us</h2>

            <p>
              If you have any questions or concerns regarding this Privacy
              Policy, please contact us:
            </p>
          </section>

          <div className="privacy-contact">
            <h3>ELYVORR PERFUME</h3>
            <p>Website: elyvorr.com</p>
            <p>Location: Ujjain, Madhya Pradesh, India</p>
            <p>Phone: 9522042144</p>
          </div>
        </div>
      </div>

      <style>{`
        .privacy-page {
          min-height: 100vh;
          background: #fff;
          padding: 60px 20px 80px;
        }

        .privacy-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .privacy-header {
          text-align: center;
          margin-bottom: 45px;
        }

        .privacy-header h1 {
          margin: 0 0 12px;
          font-size: 38px;
          font-weight: 600;
          color: #111;
        }

        .privacy-header p {
          margin: 0;
          color: #777;
          font-size: 14px;
        }

        .privacy-content {
          color: #333;
          font-size: 15px;
          line-height: 1.8;
        }

        .privacy-content > p {
          margin-bottom: 35px;
        }

        .privacy-content section {
          margin-bottom: 32px;
        }

        .privacy-content h2 {
          margin: 0 0 12px;
          font-size: 20px;
          font-weight: 600;
          color: #111;
        }

        .privacy-content p {
          margin: 0 0 14px;
        }

        .privacy-content ul {
          margin: 8px 0 16px;
          padding-left: 25px;
        }

        .privacy-content li {
          margin-bottom: 5px;
        }

        .privacy-contact {
          margin-top: 45px;
          padding-top: 25px;
          border-top: 1px solid #e5e5e5;
        }

        .privacy-contact h3 {
          margin: 0 0 8px;
          font-size: 17px;
          color: #111;
        }

        .privacy-contact p {
          margin: 3px 0;
          color: #666;
        }

        @media (max-width: 600px) {
          .privacy-page {
            padding: 40px 18px 60px;
          }

          .privacy-header {
            margin-bottom: 32px;
          }

          .privacy-header h1 {
            font-size: 30px;
          }

          .privacy-content {
            font-size: 14px;
          }

          .privacy-content h2 {
            font-size: 18px;
          }
        }
      `}</style>
    </main>
  );
};

export default PrivacyPolicyPage;
