import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">Last Updated: [Date of Last Update]</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p className="leading-relaxed">
            Welcome to Global Bene ("we," "our," "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. By using Global Bene, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
          <p className="leading-relaxed mb-2">We may collect information about you in a variety of ways. The information we may collect on the platform includes:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name, username, email address, and profile picture, that you voluntarily give to us when you register with the platform or when you choose to participate in various activities related to the platform, such as posting, joining communities, and messaging.
            </li>
            <li>
              <strong>User-Generated Content:</strong> We collect the content you create, upload, or post, including posts, comments, and messages you send to other users or within communities.
            </li>
            <li>
              <strong>Usage Data:</strong> Information our servers automatically collect when you access the platform, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the platform.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p className="leading-relaxed mb-2">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the platform to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Create and manage your account.</li>
            <li>Personalize your experience and display content relevant to your interests.</li>
            <li>Enable user-to-user communications.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the platform.</li>
            <li>Notify you of updates to the platform.</li>
            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            <li>Respond to your comments, questions, and provide customer service.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">4. Disclosure of Your Information</h2>
          <p className="leading-relaxed mb-2">We do not sell or rent your personal information to third parties. We may share information we have collected about you in certain situations:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>With Other Users:</strong> Your public profile information, posts, and comments are visible to other users of the platform.
            </li>
            <li>
              <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">5. Your Data Rights</h2>
          <p className="leading-relaxed mb-2">You have rights over your personal data. You can:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Access, update, or delete the information in your account by editing your profile or contacting us.</li>
            <li>Request a copy of the personal data we hold about you.</li>
            <li>Opt-out of receiving promotional communications from us by following the unsubscribe instructions in those communications.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">6. Security of Your Information</h2>
          <p className="leading-relaxed">
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Contact Us</h2>
          <p className="leading-relaxed">
            If you have questions or comments about this Privacy Policy, please contact us through our <Link to="/contact" className="text-blue-500 hover:underline">Contact Us</Link> page.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;