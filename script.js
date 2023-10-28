// Declaración para asignar colores a cada barra del gráfico
const colorScale = d3.scaleOrdinal(
  d3.schemeCategory10.map((color) => d3.hsl(color).darker(0.3).toString())
);
 
// Declaración para configurar el tamaño del gráfico y duración de la animación
const width = 800;
const height = 400;
const margin = { top: 20, right: 20, bottom: 30, left: 10 };
const duration = 1000; // Duración de la transición en milisegundos
 
// Uso de la biblioteca D3.js para seleccionar un elemento de la clase "chart"
const svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", width + 100)
  .attr("height", height);
 
// Crear escala lineal mediante el uso de d3.scaleLinear() para mapear valores del dominio
const xScale = d3
  .scaleLinear()
  .range([margin.left, width - margin.right - 40]);
 
// Crear escala de bandas (o categórica) para crear escala del eje vertical en el gráfico de barras.
const yScale = d3
  .scaleBand()
  .range([height - margin.bottom, margin.top])
  .padding(0.1);
 
// Lectura del dataset planteado
d3.csv("datos.csv", (d) => ({
  date: d.date,
  name: d.name,
  category: d.category,
  value: +d.value,
})).then((data) => {
  // Filtra los datos por fecha si es necesario
  // data = data.filter(d => d.date === '2019');
 
  // Crear un array para guardar las categorías únicas del dataset y las fechas únicas
  const categories = Array.from(new Set(data.map((d) => d.category)));
  const dates = Array.from(new Set(data.map((d) => d.date)));
 
  // Las siguientes líneas establecen la escala para el eje X y Y
  xScale.domain([0, d3.max(data, (d) => d.value)]);
 
  yScale.domain(data.map((d) => d.name));
 
  // Se procede a agregar ejes a un elemento SVG al gráfico de barras. El primer grupo
  // contiene al eje X y el segundo al eje Y
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
 
  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));
 
    // Filtra los datos que serán mostrados con cada actualización
  const updateBars = (date) => {
    const filteredData = data.filter((d) => d.date === date);
    // Aquí se seleccionan todos los elementos con la clase "bar" dentro del elemento SVG
    const bars = svg.selectAll(".bar").data(filteredData, (d) => d.name);
// Esto se encarga de eliminar cualquier barra que esté presente en el gráfico pero que no tenga datos asociados en el conjunto filtrado
    bars.exit().remove();
    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", xScale(0))
      .attr("y", (d) => yScale(d.name))
      .attr("width", 5)
      .attr("height", yScale.bandwidth())
      .merge(bars)
      .transition()
      .duration(duration)
      .attr("x", xScale(0))
      .attr("width", (d) => xScale(d.value))
      .attr("fill", (d) => colorScale(d.name));
 
    // Configurar dominio y rango de la escala de colores
    colorScale.domain(filteredData.map((d) => d.name));
    colorScale.range(d3.schemeCategory10);
 
// Esto asegura que las etiquetas anteriores se eliminen antes de agregar las nuevas.
    svg.selectAll(".label").remove();
// Esta parte del código selecciona elementos con la clase "label" que coincidan con los datos filtrados
    svg
      .selectAll(".label")
      .data(filteredData, (d) => d.name)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(d.value) + 5)
      .attr("y", (d) => yScale(d.name) + yScale.bandwidth() / 2)
 
      .selectAll("tspan")
      .data((d) => [
        {
          text: d.name,
          style: "font-weight: bold; font-family: Arial; font-size: 14px",
        }, // Cambio de fuente a Arial
        { text: d.value.toString(), dx: "-2em", dy: "1.2em" },
      ])
      .enter()
      .append("tspan")
      .attr("x", (d) => xScale(d.value) + 5)
      .attr("dx", (d) => d.dx || 0)
      .attr("dy", (d) => d.dy || 0)
      .attr("style", (d) => d.style || "")
      .text((d) => d.text);
 
      // Esto asegura que el año anterior se elimine antes de agregar el nuevo año.
    svg.selectAll(".year").remove();
    svg
      .append("text")
      .attr("class", "year")
      .attr("x", width - margin.right - 20) //Define la posición horizontal (x) del texto.
      .attr("y", margin.top + 10) //Define la posición vertical (y) del texto
      .text(date) // Establece el contenido de texto del elemento con el valor de la variable date, que parece representar un año.
      .style("font-weight", "bold") // Aplica un estilo CSS al texto para hacerlo negrita.
      .style("font-family", "Arial") //Define la fuente de la familia de fuentes del texto como "Arial".
      .style("font-size", "25px"); //Establece el tamaño de fuente del texto en 25 píxeles.
  };
 
  // Inicializa con la primera fecha
  updateBars(dates[0]);
 
  // Función para reproducir la animación
  function playAnimation() {
    let i = 0;
 
    function animate() {
      updateBars(dates[i]);
      i++;
      if (i < dates.length) {
        setTimeout(animate, duration);
      } else {
        i = 0;
        setTimeout(animate, duration);
      }
    }
    animate();
  }
  playAnimation();
 
});