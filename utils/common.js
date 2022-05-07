const rtf = new Intl.RelativeTimeFormat({
	localeMatcher: 'best fit', // otros valores: 'lookup'
	numeric: 'always', // otros valores: 'auto' para poner "ayer" o "anteayer"
	style: 'long', // otros valores: 'short' o 'narrow'
});

function getSecondsDiff (timestamp) {
	// restamos el tiempo actual al que le pasamos por parámetro
	// lo dividimos entre 1000 para quitar los milisegundos
	return (Date.now() - timestamp) / 1000
}

const DATE_UNITS = {
	day: 86400,
	hour: 3600,
	minute: 60,
	second: 1 // un segundo tiene... un segundo :D
}

const getUnitAndValueDate = (secondsElapsed) => {
	// creamos un for of para extraer cada unidad y los segundos en esa unidad del diccionario
	for (const [unit, secondsInUnit] of Object.entries(DATE_UNITS)) {
		// si los segundos que han pasado entre las fechas es mayor a los segundos
		// que hay en la unidad o si la unidad es "second"...
		if (secondsElapsed >= secondsInUnit || unit === "second") {
		// extraemos el valor dividiendo el tiempo que ha pasado en segundos
		// con los segundos que tiene la unidad y redondeamos la unidad
		// ej: 3800 segundos pasados / 3600 segundos (1 hora) = 1.05 horas
		// Math.floor(1.05) -> 1 hora
		// finalmente multiplicamos por -1 ya que necesitamos
		// la diferencia en negativo porque, como hemos visto antes,
		// así nos indicará el "Hace ..." en lugar del "Dentro de..."
		const value = Math.floor(secondsElapsed / secondsInUnit) * -1
		// además del valor también tenemos que devolver la unidad
		return { value, unit }
		}
	}
}
	
function getTimeAgo (timestamp) {
	// creamos una instancia de RelativeTimeFormat para traducir en castellano
	const rtf = new Intl.RelativeTimeFormat()
	// recuperamos el número de segundos de diferencia entre la fecha que pasamos
	// por parámetro y el momento actual
	const secondsElapsed = getSecondsDiff(timestamp)
	// extraemos la unidad de tiempo que tenemos que usar
	// para referirnos a esos segundos y el valor
	const {value, unit} = getUnitAndValueDate(secondsElapsed)
	// formateamos el tiempo relativo usando esos dos valores
	return rtf.format(value, unit)
  }

module.exports = { getSecondsDiff, getTimeAgo};