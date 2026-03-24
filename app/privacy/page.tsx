export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <a href="/" className="text-blue-500 hover:underline text-sm mb-8 block">← Back to BloxAppeal</a>
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: March 2026</p>

        <div className="flex flex-col gap-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-2">1. Information We Collect</h2>
            <p>When you submit an appeal, we collect your Roblox username, email address, Gmail App Password, and any additional information you provide. This information is stored securely and used solely to process your appeal.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside flex flex-col gap-1">
              <li>To generate a personalized appeal letter using AI</li>
              <li>To submit the appeal to Roblox's official support form</li>
              <li>To monitor your inbox for Roblox's response</li>
              <li>To automatically retry if an appeal is rejected</li>
              <li>To notify you when your appeal is approved</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">3. Gmail App Password</h2>
            <p>Your Gmail App Password is stored encrypted and used exclusively to check for Roblox support reply emails. We do not access, read, or store any other emails in your inbox. You can revoke the App Password at any time from your Google account settings.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">4. Data Sharing</h2>
            <p>We do not sell, trade, or share your personal information with third parties. Your appeal content is sent to Roblox's support form and processed by our AI provider (Groq) solely to generate the appeal letter.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">5. Data Retention</h2>
            <p>Your appeal data is retained until your appeal is resolved or you request deletion. To request deletion of your data, contact us.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">6. Security</h2>
            <p>We take reasonable measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">7. Contact</h2>
            <p>If you have any questions about this Privacy Policy, please reach out through our Discord server.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
