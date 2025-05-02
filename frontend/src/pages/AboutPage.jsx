const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">About Countries Explorer</h1>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Our Mission</h2>
          <p className="mb-4">
            Countries Explorer is dedicated to providing comprehensive and accessible information about 
            countries around the world. Our goal is to create an educational platform that helps users 
            discover and learn about the diverse nations that make up our global community.
          </p>
          <p>
            Whether you're a student researching for a project, a traveler planning your next adventure, 
            or simply curious about the world, we aim to be your go-to resource for country information.
          </p>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Data Sources</h2>
          <p className="mb-4">
            Our information comes from the REST Countries API, which provides detailed and up-to-date 
            data about countries worldwide. This includes information about:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Official names and languages</li>
            <li>Population statistics</li>
            <li>Geographic information</li>
            <li>Currencies</li>
            <li>Flag images</li>
            <li>Regional classifications</li>
          </ul>
          <p>
            We strive to ensure our data is accurate and regularly updated.
          </p>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Technology</h2>
          <p className="mb-4">
            Countries Explorer is built with modern web technologies:
          </p>
          <ul className="list-disc pl-6">
            <li>React for the user interface</li>
            <li>React Router for navigation</li>
            <li>Tailwind CSS for styling</li>
            <li>REST Countries API for data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
