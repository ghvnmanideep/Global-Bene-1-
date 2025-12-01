import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
          About Global Bene
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            At Global Bene, our mission is to build a global network of communities centered around shared interests, support, and positive action. We believe that by connecting people from diverse backgrounds, we can foster understanding, inspire collaboration, and empower individuals to make a meaningful impact in their own lives and the world around them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">What is Global Bene?</h2>
          <p className="text-lg leading-relaxed mb-4">
            Global Bene is a dynamic, community-driven platform where you can discover, create, and engage with communities that matter to you. Whether you're passionate about a hobby, seeking support for a cause, looking to learn a new skill, or simply want to connect with like-minded individuals, Global Bene provides the tools and the space to do so.
          </p>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li><strong>Discover & Join:</strong> Explore a wide range of communities created by users from around the world.</li>
            <li><strong>Create & Lead:</strong> Start your own community and bring people together around a topic you're passionate about.</li>
            <li><strong>Share & Discuss:</strong> Post content, share ideas, ask questions, and engage in meaningful conversations.</li>
            <li><strong>Connect & Collaborate:</strong> Build relationships with other members and collaborate on projects and initiatives.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Commitment</h2>
          <p className="text-lg leading-relaxed">
            We are committed to creating a safe, inclusive, and respectful environment for all our users. Our platform is built on the principles of trust and transparency. We actively moderate content and provide tools for community leaders to manage their spaces effectively. Your privacy and security are paramount, and we are dedicated to protecting your data and providing you with control over your personal information.
          </p>
          <p className="text-lg leading-relaxed mt-4">
            Thank you for being a part of the Global Bene family. Together, let's build something great.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;