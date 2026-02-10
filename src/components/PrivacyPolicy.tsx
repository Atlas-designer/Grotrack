export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-navy-950 text-gray-300">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 text-sm mb-8 transition-colors"
        >
          &larr; Back to Grotrack
        </a>

        <h1 className="text-3xl font-bold text-white mb-2">Grotrack Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <p>
            Grotrack is a personal, non-profit project created for individual and household use. It
            is not operated as a commercial service and is not intended for resale or commercial
            distribution.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Information We Collect</h2>
            <p>
              We may collect limited personal information required for the app to function, including
              account identifiers, household inventory data, shopping list entries, and user
              preferences.
            </p>
            <p className="mt-3">
              If you enable the Grotrack Alexa skill, we receive a unique Alexa user identifier and
              the text of voice commands. We do not receive or store raw audio recordings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. How Information Is Used</h2>
            <p>
              Information is used solely to provide core functionality such as inventory tracking,
              shopping list management, and responding to Alexa voice requests. Data is not sold,
              rented, or shared for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Data Storage</h2>
            <p>
              All data is stored securely using modern cloud infrastructure. Reasonable technical and
              organizational measures are taken to protect data from unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Data Sharing</h2>
            <p>
              Grotrack does not share personal data with third parties except where required to
              provide core services (such as Amazon Alexa voice processing).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. User Control</h2>
            <p>
              Users may request deletion of their data by discontinuing use of the service. Because
              this is a personal, non-commercial project, support is provided on a best-effort basis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Children's Privacy</h2>
            <p>
              Grotrack is not intended for use by children under the age of 13 and does not knowingly
              collect data from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Changes to This Policy</h2>
            <p>
              This policy may be updated periodically to reflect changes in functionality or legal
              requirements. Continued use of Grotrack constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Contact</h2>
            <p>
              For privacy-related questions, please contact the project owner via the Grotrack GitHub
              repository.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
