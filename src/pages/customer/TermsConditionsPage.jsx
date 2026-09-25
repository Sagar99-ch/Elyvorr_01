import React from "react";

const TermsConditionsPage = () => {
  return (
    <main className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <h1>Terms & Conditions</h1>
          <p>Last Updated: September 2026</p>
        </div>

        <div className="terms-content">
          <p>
            Welcome to <strong>ELYVORR PERFUME</strong>. By accessing or using
            our website <strong>ELYVORR.com</strong>, you agree to the following
            Terms & Conditions. Please read them carefully before placing an
            order.
          </p>

          <section>
            <h2>1. General</h2>
            <p>
              ELYVORR PERFUME reserves the right to update, modify, or change
              these Terms & Conditions at any time without prior notice.
            </p>
          </section>

          <section>
            <h2>2. Products</h2>
            <p>
              We make every effort to display our perfumes, packaging, images,
              descriptions, and prices accurately. However, slight variations in
              colour, packaging, or appearance may occur.
            </p>

            <p>
              Our fragrances may be inspired by the scent profile of other
              well-known fragrances. ELYVORR PERFUME is an independent brand and
              is not affiliated with or endorsed by any other perfume brand
              unless specifically stated.
            </p>
          </section>

          <section>
            <h2>3. Orders</h2>
            <p>
              Once an order is placed, you will receive an order confirmation.
              We reserve the right to cancel or refuse an order in cases such as
              incorrect pricing, product unavailability, payment issues, or
              suspected fraudulent activity.
            </p>
          </section>

          <section>
            <h2>4. Pricing & Payment</h2>
            <p>
              All product prices displayed on the website are subject to change
              without prior notice.
            </p>

            <p>
              Customers must provide accurate payment and billing information
              while placing an order. Orders will be processed only after
              successful payment confirmation, where applicable.
            </p>
          </section>

          <section>
            <h2>5. Shipping & Delivery</h2>
            <p>
              We aim to dispatch orders within the estimated processing time
              shown on the website. Delivery time may vary depending on the
              customer's location and the courier partner.
            </p>

            <p>
              ELYVORR PERFUME is not responsible for delays caused by courier
              services, weather conditions, natural events, strikes, or other
              circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2>6. Address & Delivery Information</h2>
            <p>
              Customers are responsible for providing a correct and complete
              delivery address and contact number.
            </p>

            <p>
              If an order is returned due to an incorrect address, unavailable
              recipient, refusal to accept the package, or repeated delivery
              attempts, additional shipping charges may apply for re-shipment.
            </p>
          </section>

          <section>
            <h2>7. Returns & Refunds</h2>
            <p>
              Due to the nature of fragrance products and hygiene
              considerations, returns or exchanges may not be accepted once the
              product has been delivered and opened or used, except where the
              product is received damaged, defective, or incorrect.
            </p>

            <p>
              If you receive a damaged or incorrect product, please contact us
              as soon as possible with clear photographs/videos of the package
              and product.
            </p>

            <p>
              Refunds, if approved, will be processed according to our refund
              policy and the applicable payment method.
            </p>
          </section>

          <section>
            <h2>8. Damaged Products</h2>
            <p>
              Customers should record an unboxing video when opening the
              package. This may be required to verify damage or missing items.
            </p>

            <p>
              Any damage or missing product should be reported to us within
              <strong> 48 hours</strong> of delivery.
            </p>
          </section>

          <section>
            <h2>9. Perfume Usage</h2>
            <p>
              Perfumes should be used as directed on the product packaging.
              Avoid contact with eyes and keep the product away from children,
              heat, flames, and direct sunlight.
            </p>

            <p>
              ELYVORR PERFUME shall not be responsible for reactions or damage
              caused by improper use of the product.
            </p>
          </section>

          <section>
            <h2>10. Website Content</h2>
            <p>
              All content on ELYVORR.com, including logos, photographs,
              graphics, product descriptions, text, and other materials, belongs
              to ELYVORR PERFUME unless otherwise stated.
            </p>

            <p>
              Unauthorised copying, reproduction, modification, or commercial
              use of our content is prohibited.
            </p>
          </section>

          <section>
            <h2>11. Privacy</h2>
            <p>
              We respect your privacy and handle customer information in
              accordance with our Privacy Policy. By using our website, you
              agree to the collection and use of information as described in our
              Privacy Policy.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions regarding these Terms & Conditions,
              orders, products, or other concerns, please contact us through the
              contact details provided on our website.
            </p>
          </section>

          <div className="terms-contact">
            <h3>ELYVORR PERFUME</h3>
            <p>Ujjain, Madhya Pradesh, India</p>
            <p>Website: ELYVORR.com</p>
          </div>
        </div>
      </div>

      <style>{`
        .terms-page {
          min-height: 100vh;
          background: #fff;
          padding: 60px 20px 80px;
        }

        .terms-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .terms-header {
          text-align: center;
          margin-bottom: 45px;
        }

        .terms-header h1 {
          margin: 0 0 12px;
          font-size: 38px;
          font-weight: 600;
          color: #111;
        }

        .terms-header p {
          margin: 0;
          color: #777;
          font-size: 14px;
        }

        .terms-content {
          color: #333;
          font-size: 15px;
          line-height: 1.8;
        }

        .terms-content > p {
          margin-bottom: 35px;
        }

        .terms-content section {
          margin-bottom: 32px;
        }

        .terms-content h2 {
          margin: 0 0 12px;
          font-size: 20px;
          font-weight: 600;
          color: #111;
        }

        .terms-content p {
          margin: 0 0 14px;
        }

        .terms-contact {
          margin-top: 45px;
          padding-top: 25px;
          border-top: 1px solid #e5e5e5;
        }

        .terms-contact h3 {
          margin: 0 0 8px;
          font-size: 17px;
          color: #111;
        }

        .terms-contact p {
          margin: 3px 0;
          color: #666;
        }

        @media (max-width: 600px) {
          .terms-page {
            padding: 40px 18px 60px;
          }

          .terms-header {
            margin-bottom: 32px;
          }

          .terms-header h1 {
            font-size: 30px;
          }

          .terms-content {
            font-size: 14px;
          }

          .terms-content h2 {
            font-size: 18px;
          }
        }
      `}</style>
    </main>
  );
};

export default TermsConditionsPage;
